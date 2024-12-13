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
  ArrayNode,
  IndexNode,
  IndexAssignmentNode,
} from "./ast-nodes";
import { FunctionVariable, concat, index, pop, printLn, push, setIndex } from "./functions";
import { evaluateBinaryOp, evaluateCondition } from "./utils";
import { ArrayVariable, BooleanVariable, NullVariable, NumberVariable, StringVariable, Variable, VariableType } from "./variables";

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
        return;
      } else {
        throw new Error(`Variable "${name}" is already defined.`);
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
    
    if(left.type != VariableType.Number) throw new Error(`Variable ${left.name} is of type ${left.type} and can't be used in a math operation. At line: ${node.line}:${node.char}`);
    if(right.type != VariableType.Number) throw new Error(`Variable ${right.name} is of type ${right.type} and can't be used in a math operation. At line: ${node.line}:${node.char}`);

    return evaluateBinaryOp(node.operator, left, right);

  } else if (node instanceof NumberNode) {

    return new NumberVariable(parseFloat(node.value));

  } else if (node instanceof StringNode) {

    return new StringVariable(node.value);

  } else if (node instanceof BooleanNode) {
    const value = node.value === "true";
    return new BooleanVariable(value);

  } else if (node instanceof ArrayNode) {
    const variables = [];
    for(const arrayNode of node.value) {
      variables.push(executeAST(arrayNode, context));
    }
    return new ArrayVariable(variables);

  } else if (node instanceof IndexNode) {
    
    const index = executeAST(node.index, context);

    if(index.type !== VariableType.Number || index.value === undefined) {
      throw new Error(`Value ${index} can't be used as an index, must be of type NUMBER. At line: ${node.line}:${node.char}`);
    }

    const array = executeAST(node.value, context);
    
    if(array.type !== VariableType.Array) {
        throw new Error(`Can't access index of type ${array.type}, must be of type ARRAY. At line: ${node.line}:${node.char}`);
    }

    if(array.value.length <= index.value) {
      throw new Error(`Index ${index.value} is out of bounds for array ${array.name}. At line: ${node.line}:${node.char}`);
    }

    return array.value[index.value];

  } else if (node instanceof NameNode) {

    return context.getVariable(node.value);

  } else if (node instanceof AssignmentNode) {

    const value = executeAST(node.value, context);
    value.name = node.name.value;
    context.setVariable(node.name.value, value);
    return value;

  }else if (node instanceof IndexAssignmentNode) {

    const value = executeAST(node.value, context);
    value.name = node.name.value;

    const array = context.getVariable(node.name.value);

    if(array.type !== VariableType.Array) throw new Error(`Can't access index of type ${array.type}, must be of type ARRAY. At line: ${node.line}:${node.char}`);

    const enterArray = (indexes: ASTNode[], currentArray: ArrayVariable): ArrayVariable => {
      const indexNumber = executeAST(indexes.shift()!, context);

      if(indexNumber.type !== VariableType.Number || indexNumber.value === undefined) throw new Error(`Value ${indexNumber} can't be used as an index, must be of type NUMBER. At line: ${node.line}:${node.char}`);
      

      if(indexes.length === 0) {
        if(indexNumber.value >= currentArray.value.length) throw new Error(`Index ${indexNumber.value} is out of bounds for array ${array.name}. At line: ${node.line}:${node.char}`);

        currentArray.value[indexNumber.value] = value;
        return currentArray;
      }

      const finalArray = [];

      for (let i = 0; i < currentArray.value.length; i++) {

        if(i === indexNumber.value) {
          const element = currentArray.value[indexNumber.value];

          if(element.type !== VariableType.Array) throw new Error(`Can't access index of type ${element.type}, must be of type ARRAY. At line: ${node.line}:${node.char}`);

          currentArray.value[indexNumber.value] = enterArray(indexes, element);
        }

        finalArray.push(currentArray.value[i]);
      }

      return new ArrayVariable(finalArray);
    
    }

    const finalArray = enterArray(node.indexes, array)

    context.setVariable(node.name.value, finalArray);

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
        throw new Error(`Function ${node.value} expected 1 or more parameters, received ${variableParameters.length}. At line: ${node.line}:${node.char}`);
      const output = printLn(variableParameters);
      newContext.addOutput(output);

    } else if(node.value === "concat") {

      if(variableParameters.length < 1) 
        throw new Error(`Function ${node.value} expected 1 or more parameters, received ${variableParameters.length}. At line: ${node.line}:${node.char}`);
      return concat(variableParameters);

    } else if(node.value === "index") {

      if(variableParameters.length < 2) 
        throw new Error(`Function ${node.value} expected 2 parameters, received ${variableParameters.length}. At line: ${node.line}:${node.char}`);
      
      if(variableParameters[0].type != VariableType.Number) throw new Error(`${variableParameters[0].name} isn't of type ${VariableType.Number}. At line: ${node.line}:${node.char}`);
      if(variableParameters[1].type != VariableType.Array) throw new Error(`${variableParameters[1].name} isn't of type ${VariableType.Array}. At line: ${node.line}:${node.char}`);

      return index(variableParameters[0], variableParameters[1]);

    } else if(node.value === "push") {

      if(variableParameters.length < 2) 
        throw new Error(`Function ${node.value} expected 2 parameters, received ${variableParameters.length}. At line: ${node.line}:${node.char}`);
      
      if(variableParameters[1].type != VariableType.Array) throw new Error(`${variableParameters[1].name} isn't of type ${VariableType.Array}. At line: ${node.line}:${node.char}`);
      
      const newArray = push(variableParameters[0], variableParameters[1]);

      context.setVariable(newArray.name, newArray);

      return newArray;

    } else if(node.value === "setIndex") {

      if(variableParameters.length < 3) 
        throw new Error(`Function ${node.value} expected 3 parameters, received ${variableParameters.length}.`);
      
      if(variableParameters[0].type != VariableType.Number) throw new Error(`${variableParameters[0].name} isn't of type ${VariableType.Number}. At line: ${node.line}:${node.char}`);
      if(variableParameters[2].type != VariableType.Array) throw new Error(`${variableParameters[2].name} isn't of type ${VariableType.Array}. At line: ${node.line}:${node.char}`);

      
      const newArray = setIndex(variableParameters[0], variableParameters[1], variableParameters[2]);
      
      context.setVariable(newArray.name, newArray);

      return newArray;

    } else if(node.value === "pop") {

      if(variableParameters.length < 2) 
        throw new Error(`Function ${node.value} expected 2 parameters, received ${variableParameters.length}.`);
      
      if(variableParameters[1].type != VariableType.Array) throw new Error(`${variableParameters[1].name} isn't of type ${VariableType.Array}. At line: ${node.line}:${node.char}`);
      
      const popped = pop(variableParameters[1], context);

      return popped;

    } else if(node.value === "length") {

      if(variableParameters.length < 1) 
        throw new Error(`Function ${node.value} expected 1 parameters, received ${variableParameters.length}. At line: ${node.line}:${node.char}`);
      
      if(variableParameters[0].type !== VariableType.Array) throw new Error(`${variableParameters[1].name} isn't of type ${VariableType.Array}. At line: ${node.line}:${node.char}`);
      
      const length = variableParameters[0].value.length;

      return new NumberVariable(length);

    } else {
      const func = context.getFunction(node.value);

      if(variableParameters.length != func.parameterCount) throw new Error(`Function ${func.name} expected ${func.parameterCount} parameters, received ${variableParameters.length}. At line: ${node.line}:${node.char}`);

      let i = 0;

      for(const param of func.value.parameters) {
        if(variableParameters[i].type != param.param_type) {
          throw new Error(`Incorret parameter type passed to function ${func.name}! Parameter ${param.name.value} expected type ${param.value.type}, received ${variableParameters[i].type} At line: ${node.line}:${node.char}`);
        }
        newContext.initializeVariable(param.name.value, variableParameters[i]);
        i++;
      }

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

  throw new Error(`Unsupported AST node: ${JSON.stringify(node, null, 4)}  At line: ${node.line}:${node.char}`);
}
