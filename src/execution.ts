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
  FunctionNode,
} from "./ast-nodes";
import { printLn } from "./functions";
import { evaluateBinaryOp, evaluateCondition } from "./utils";
import { BooleanVariable, NullVariable, NumberVariable, StringVariable, Variable, VariableType } from "./variables";

export class ExecutionContext {
  private variables: { [key: string]: Variable } = {};

  public setVariable(name: string, variable: Variable) {
    if (!(name in this.variables)) {
      throw new Error(`Variable "${name}" is not defined.`);
    }
    if(this.variables[name].type !== variable.type) {
      throw new Error(`Variable "${name}" (${this.variables[name].type}) is not of type ${variable.type}.`);
    }
    this.variables[name] = variable;
  }

  public initializeVariable(name: string, variable: Variable) {
    this.variables[name] = variable;
  }

  public deleteVariable(name: string) {
    delete this.variables[name];
  }

  public getVariable(name: string): Variable {
    if (!(name in this.variables)) {
      throw new Error(`Variable "${name}" is not defined.`);
    }
    return this.variables[name];
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

    const conditionResult = executeAST(node.condition, context);
    if (conditionResult.value) {

      for(const thenNode of node.thenBranch) {
        executeAST(thenNode, context);
      }

      return new NullVariable();

    } else if (node.elseBranch) {

      for(const elseNode of node.elseBranch) {
        executeAST(elseNode, context);
      }

      return new NullVariable();
    }

  } else if (node instanceof WhileNode) {

    let conditionResult: BooleanVariable = executeAST(node.condition, context) as BooleanVariable;

    while (conditionResult.value) {
      for(const doNode of node.doBranch) {
        executeAST(doNode, context)
      }
      conditionResult = executeAST(node.condition, context) as BooleanVariable;
      if(!conditionResult.value) return new NullVariable();
    }

  } else if (node instanceof ForNode) {

    executeAST(node.index, context);

    let conditionResult: BooleanVariable = executeAST(node.condition, context) as BooleanVariable;

    while (conditionResult.value) {
      for(const doNode of node.doBranch) {
        executeAST(doNode, context)
      }
      executeAST(node.endStatement, context);
      conditionResult = executeAST(node.condition, context) as BooleanVariable;
    }

    return new NullVariable();

  } else if (node instanceof FunctionNode) {
    const variableParameters: Variable[] = [];

    for(const parameter of node.parameters) {
      variableParameters.push(executeAST(parameter, context));
    }

    if(node.value === "printLn") {
      if(variableParameters.length < 1) 
        throw new Error(`Function ${node.value} expected 1 or more parameters, received ${variableParameters.length}.`);
      printLn(variableParameters);
    } else {
      throw new Error(`Function ${node.value} is not defined.`)
    }

    return new NullVariable();

  }

  else if (node instanceof ConditionalNode) {

    const left = executeAST(node.left, context);
    const right = executeAST(node.right, context);
    return evaluateCondition(node.operator, left, right);

  } 

  throw new Error(`Unsupported AST node: ${JSON.stringify(node, null, 4)}`);
}
