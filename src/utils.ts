import { BooleanVariable, NumberVariable, Variable, VariableType } from "./variables";

// utils.ts
export function evaluateBinaryOp(
  operator: string,
  left: NumberVariable,
  right: NumberVariable
): NumberVariable {

  switch (operator) {
    case "+":
      return new NumberVariable(left.value + right.value);
    case "-":
      return new NumberVariable(left.value - right.value);
    case "*":
      return new NumberVariable(left.value * right.value);
    case "/":
      if (right.value === 0) {
        throw new Error("Division by zero.");
      }
      return new NumberVariable(left.value / right.value);
    case "%":
      return new NumberVariable(left.value % right.value);
    default:
      throw new Error(`Operator not supported: ${operator}`);
  }
}

export function evaluateCondition(
  operator: string,
  left: Variable,
  right: Variable
): BooleanVariable {

  if(left.type != right.type) throw new Error(`Variables ${left.name} (${left.type}) and ${right.name} (${right.type}) aren't of same type!`)
  
  if(left.type === VariableType.Number && right.type === VariableType.Number) {
    switch (operator) {
      case "==":
        return new BooleanVariable(left.value === right.value);
      case "!=":
        return new BooleanVariable(left.value !== right.value);
      case "<":
        return new BooleanVariable(left.value < right.value);
      case "<=":
        return new BooleanVariable(left.value < right.value);
      case ">":
        return new BooleanVariable(left.value < right.value);
      case ">=":
        return new BooleanVariable(left.value >= right.value);
      default:
        throw new Error(`Conditional operator "${operator}" not supported for type: ${left.type}`);
    }
  }
  
  else if(left.type === VariableType.Boolean && right.type === VariableType.Boolean) {
    switch (operator) {
      case "==":
        return new BooleanVariable(left.value === right.value);
      case "!=":
        return new BooleanVariable(left.value !== right.value);
      default:
        throw new Error(`Conditional operator "${operator}" not supported for type: ${left.type}`);
    }
  }

  else if(left.type === VariableType.String && right.type === VariableType.String) {
    switch (operator) {
      case "==":
        return new BooleanVariable(left.value === right.value);
      case "!=":
        return new BooleanVariable(left.value !== right.value);
      default:
        throw new Error(`Conditional operator "${operator}" not supported for type: ${left.type}`);
    }
  }

  else if(left.type === VariableType.Null && right.type === VariableType.Null) {
    switch (operator) {
      case "==":
        return new BooleanVariable(true);
      case "!=":
        return new BooleanVariable(false);
      default:
        throw new Error(`Conditional operator "${operator}" not supported for type: ${left.type}`);
    }
  }

  throw new Error(`Unexpect variable types for condition.`);
}