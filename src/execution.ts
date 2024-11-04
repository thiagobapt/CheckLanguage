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
} from "./ast-nodes";
import { evaluateBinaryOp, evaluateCondition } from "./utils";

export class ExecutionContext {
  private variables: { [key: string]: number } = {};

  public setVariable(name: string, value: number) {
    this.variables[name] = value;
  }

  public getVariable(name: string): number {
    if (!(name in this.variables)) {
      throw new Error(`Variable "${name}" is not defined.`);
    }
    return this.variables[name];
  }
}

export function executeAST(node: ASTNode, context: ExecutionContext): number {

  if (node instanceof BinaryOpNode) {

    const left = executeAST(node.left, context);
    const right = executeAST(node.right, context);
    return evaluateBinaryOp(node.operator, left, right);

  } else if (node instanceof NumberNode) {

    return parseFloat(node.value);

  } else if (node instanceof NameNode) {

    return context.getVariable(node.value);

  } else if (node instanceof AssignmentNode) {

    const value = executeAST(node.value, context);
    context.setVariable(node.name.value, value);
    return value;

  } else if (node instanceof IfNode) {

    const conditionResult = executeAST(node.condition, context);
    if (conditionResult) {

      for(const thenNode of node.thenBranch) {
        executeAST(thenNode, context);
      }

      return 0;

    } else if (node.elseBranch) {

      for(const elseNode of node.elseBranch) {
        executeAST(elseNode, context);
      }

      return 0;
    }

  } else if (node instanceof WhileNode) {

    let conditionResult = executeAST(node.condition, context);

    while (conditionResult) {
      for(const doNode of node.doBranch) {
        executeAST(doNode, context)
      }
      conditionResult = executeAST(node.condition, context);
      if(!conditionResult) return 0;
    }

  } else if (node instanceof ForNode) {

    executeAST(node.index, context);

    let conditionResult = executeAST(node.condition, context);

    while (conditionResult) {
      for(const doNode of node.doBranch) {
        executeAST(doNode, context)
      }
      executeAST(node.endStatement, context);
      conditionResult = executeAST(node.condition, context);
    }

    return 0;

  }

  else if (node instanceof ConditionalNode) {

    const left = executeAST(node.left, context);
    const right = executeAST(node.right, context);
    return evaluateCondition(node.operator, left, right) ? 1 : 0;;

  } 

  throw new Error(`Unsupported AST node: ${JSON.stringify(node, null, 4)}`);
}
