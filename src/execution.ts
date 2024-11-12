// executions.ts
import {
  ASTNode,
  BinaryOpNode,
  NumberNode,
  NameNode,
  AssignmentNode,
  IfNode,
  ConditionalNode,
  WhileNode,
  ForNode,
  InitializationNode,
  StringNode,
  BooleanNode,
  FunctionCallNode,
  FunctionNode,
  ReturnNode,
  ParameterDeclarationNode,
  FunctionDeclarationNode,
} from "./ast-nodes";
import { FunctionVariable, concat, printLn } from "./functions";
import { evaluateBinaryOp, evaluateCondition } from "./utils";
import { BooleanVariable, NullVariable, NumberVariable, StringVariable, Variable, VariableType } from "./variables";

export class ExecutionContext {
  private variables: { [key: string]: Variable } = {};
  private functions: { [key: string]: FunctionVariable } = {};
  private outputs: string[] = [];
  private scope?: ExecutionContext;

  constructor(context?: ExecutionContext) {
    if(context) {
      this.scope = context;
    }
  }

  public newScope(): ExecutionContext {
    const newScope = new ExecutionContext(this);
    return newScope;
  }

  public setVariable(name: string, variable: Variable) {

    if (!(name in this.variables)) {
      if(this.scope) {
        this.scope.setVariable(name, variable);
      } else {
        throw new Error(`Variable "${name}" is not defined.`);
      }
    }

    if(this.variables[name].type !== variable.type) {
      throw new Error(`Variable "${name}" (${this.variables[name].type}) is not of type ${variable.type}.`);
    }
    this.variables[name] = variable;
    
  }

  public initializeVariable(name: string, variable: Variable) {
    if ((name in this.variables)) {
      throw new Error(`Variable "${name}" was already initialized.`);
    }
    this.variables[name] = variable;
  }

  public deleteVariable(name: string) {
    delete this.variables[name];
  }

  public getVariable(name: string): Variable {
    if (!(name in this.variables)) {
      if(this.scope) {
        return this.scope.getVariable(name);
      } else {
        throw new Error(`Variable "${name}" is not defined.`);
      }
    }
    return this.variables[name];
  }

  public getFunction(name: string): FunctionVariable {
    if (!(name in this.functions)) {
      if(this.scope) {
        return this.scope.getFunction(name);
      } else {
        throw new Error(`Function "${name}" is not defined.`);
      }
    }
    return this.functions[name];
  }

  public initializeFunction(name: string, func: FunctionVariable) {
    if ((name in this.functions)) {
      throw new Error(`Function "${name}" was already initialized.`);
    }
    this.functions[name] = func;
  }

  public addOutput(output: string) {
    if(!this.scope) {
      this.outputs.push(output);
    } else {
      this.scope.addOutput(output);
    }
  }

  public addOutputs(outputs: string[]){
    for(const output of outputs) this.outputs.push(output);
  }

  public getOutput() {
    return this.outputs;
  }
}

export function executeAST(node: ASTNode, context: ExecutionContext): Variable {
  if (node instanceof BinaryOpNode) {

    const left = executeAST(node.left, context);
    const right = executeAST(node.right, context);
    
    if(left.type != VariableType.Number) throw new Error(`Variable ${left.name} is of type ${left.type} and can't be used in a math operation.`);
    if(right.type != VariableType.Number) throw new Error(`Variable ${right.name} is of type ${right.type} and can't be used in a math operation.`);

    return evaluateBinaryOp(node.operator, left, right);

  } else if (node instanceof NumberNode) {

    return new NumberVariable(parseFloat(node.value));

  } else if (node instanceof StringNode) {

    return new StringVariable(node.value);

  } else if (node instanceof BooleanNode) {
    const value = node.value === "true";
    return new BooleanVariable(value);

  } else if (node instanceof NameNode) {

    return context.getVariable(node.value);

  } else if (node instanceof AssignmentNode) {

    const value = executeAST(node.value, context);
    value.name = node.name.value;
    context.setVariable(node.name.value, value);
    return value;

  }  else if (node instanceof InitializationNode) {

    const value = executeAST(node.value, context);
    value.name = node.name.value;
    context.initializeVariable(node.name.value, value);
    return value;

  } else if (node instanceof IfNode) {
    const newContext = context.newScope();

    const conditionResult = executeAST(node.condition, newContext);
    if (conditionResult.value) {

      for(const thenNode of node.thenBranch) {
        if(thenNode instanceof ReturnNode) return executeAST(thenNode, newContext);
        executeAST(thenNode, newContext);
      }

      return new NullVariable();

    } else if (node.elseBranch) {

      for(const elseNode of node.elseBranch) {
        if(elseNode instanceof ReturnNode) return executeAST(elseNode, newContext);
        executeAST(elseNode, newContext);
      }

      return new NullVariable();
    }

  } else if (node instanceof WhileNode) {

    const newContext = context.newScope();

    let conditionResult: BooleanVariable = executeAST(node.condition, newContext) as BooleanVariable;

    while (conditionResult.value) {
      for(const doNode of node.doBranch) {
        if(doNode instanceof ReturnNode) return executeAST(doNode, newContext);
        executeAST(doNode, newContext)
      }
      conditionResult = executeAST(node.condition, newContext) as BooleanVariable;
      if(!conditionResult.value) return new NullVariable();
    }

  } else if (node instanceof ForNode) {

    const newContext = context.newScope();

    executeAST(node.index, newContext);

    let conditionResult: BooleanVariable = executeAST(node.condition, newContext) as BooleanVariable;

    while (conditionResult.value) {
      for(const doNode of node.doBranch) {
        if(doNode instanceof ReturnNode) return executeAST(doNode, newContext);
        executeAST(doNode, newContext)
      }
      executeAST(node.endStatement, newContext);
      conditionResult = executeAST(node.condition, newContext) as BooleanVariable;
    }

    return new NullVariable();

  } else if (node instanceof FunctionNode) {

    const newContext = context.newScope();

    let returnValue: Variable = new NullVariable();

    for(const execNode of node.executeBranch) {
      if(execNode instanceof ReturnNode) {
        returnValue = executeAST(execNode, newContext);
        break;
      } else {
        const result = executeAST(execNode, newContext);
        if(result.type != VariableType.Null) return result;
      }
    }

    for(const param of node.parameters) {
      newContext.deleteVariable(param.name.value);
    }

    return returnValue;

  } else if(node instanceof ReturnNode) {

    return executeAST(node.value, context);

  } else if (node instanceof FunctionCallNode) {
    const newContext = context.newScope();

    const variableParameters: Variable[] = [];

    for(const parameter of node.parameters) {
      variableParameters.push(executeAST(parameter, newContext));
    }

    if(node.value === "printLn") {

      if(variableParameters.length < 1) 
        throw new Error(`Function ${node.value} expected 1 or more parameters, received ${variableParameters.length}.`);
      const output = printLn(variableParameters);
      newContext.addOutput(output);

    } else if(node.value === "concat") {

      if(variableParameters.length < 1) 
        throw new Error(`Function ${node.value} expected 1 or more parameters, received ${variableParameters.length}.`);
      return concat(variableParameters);

    } else {
      const func = context.getFunction(node.value);

      let i = 0;

      for(const param of func.value.parameters) {
        if(variableParameters[i].type != param.param_type) {
          throw new Error(`Incorret parameter type passed to function ${func.name}! Parameter ${param.name.value} expected type ${param.value.type}, received ${variableParameters[i].type}`);
        }
        newContext.initializeVariable(param.name.value, variableParameters[i]);
        i++;
      }
      

      if(variableParameters.length != func.parameterCount) 
        throw new Error(`Function ${func.name} expected ${func.parameterCount} parameters, received ${variableParameters.length}.`);

      return executeAST(func.value, newContext);
    }

    return new NullVariable();

  }

  else if (node instanceof ConditionalNode) {

    const left = executeAST(node.left, context);
    const right = executeAST(node.right, context);
    return evaluateCondition(node.operator, left, right);

  }

  else if (node instanceof FunctionDeclarationNode) {
    const func = new FunctionVariable(node.value.value, node.value);
    context.initializeFunction(node.value.value, func);
    return new NullVariable();

  }

  else if (node instanceof ParameterDeclarationNode) {

    return new NullVariable();

  }

  throw new Error(`Unsupported AST node: ${JSON.stringify(node, null, 4)}`);
}
