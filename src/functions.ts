import { FunctionNode } from "./ast-nodes";
import { executeAST, ExecutionContext } from "./execution";
import { ArrayVariable, NullVariable, NumberVariable, StringVariable, Variable, VariableType } from "./variables";

export class FunctionVariable {
    public name: string;
    public type: VariableType = VariableType.Null;
    public value: FunctionNode;
    public parameterCount: number;

    constructor(name: string = "", value: FunctionNode, type?: VariableType) {
        this.name = name;
        this.value = value;
        this.parameterCount = value.parameters.length;
        if(type) this.type = type;
    }
}

export function printLn(variables: Variable[]) {
    let result = "";

    const printValues = (variable: Variable) => {
        let stringValue = "";
        if(variable.value === undefined) {
            stringValue = "undefined";
            return stringValue;
        }

        if(variable.type === VariableType.Number) {
            stringValue = variable.value.toString();
        } else if(variable.type === VariableType.Boolean) {
            stringValue = variable.value.toString();
        } else if(variable.type === VariableType.String) {
            stringValue = variable.value;
        } else if(variable.type === VariableType.Null) {
            stringValue = "null";
        } else if(variable.type === VariableType.Array) {
            let index = 0;
            stringValue = "["
            for(const value of variable.value) {
                stringValue = stringValue.concat(printValues(value));
                if(index < variable.value.length - 1) stringValue = stringValue.concat(", ");
                index++;
            }
            stringValue = stringValue.concat("]");
        }
        return stringValue;
    }

    for(const variable of variables) {
        result = result.concat(printValues(variable));
    }

    console.log(result);
    return result;
}

export function concat(variables: Variable[]) {
    let result = "";
    for(const variable of variables) {
        let stringValue = "";

        if(variable.value === undefined) {
            stringValue = "undefined";
            continue;
        }

        if(variable.type === VariableType.Number) {
            stringValue = variable.value.toString();
        } else if(variable.type === VariableType.Boolean) {
            stringValue = variable.value.toString();
        } else if(variable.type === VariableType.String) {
            stringValue = variable.value;
        } else if(variable.type === VariableType.Null) {
            stringValue = "null";
        } 

        result = result.concat(stringValue)
    }

    return new StringVariable(result);
}

export function index(index: NumberVariable, array: ArrayVariable, context: ExecutionContext) {
    if(index.value === undefined) throw new Error(`${index.name} is undefined`);
    if(index.value >= array.value.length) throw new Error(`Index ${index.value} is out of bounds for ${array.name.length === 0 ? array.value.toString() : array.name}`);

    return array.value[index.value];
}

export function setIndex(index: NumberVariable, value: Variable, array: ArrayVariable) {
    if(index.value === undefined) throw new Error(`${index.name} is undefined`);
    if(index.value >= array.value.length) throw new Error(`Index ${index.value} is out of bounds for ${array.name.length === 0 ? array.value.toString() : array.name}`);
    
    array.value[index.value] = value;

    return array;
}

export function push(variable: Variable, array: ArrayVariable) {
    array.value.push(variable);

    return array;
}

export function pop(array: ArrayVariable, context: ExecutionContext) {
    const popped = array.value.pop();

    context.setVariable(array.name, array);

    return popped ? popped : new NullVariable();
}