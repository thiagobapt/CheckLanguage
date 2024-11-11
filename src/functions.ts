import { FunctionNode } from "./ast-nodes";
import { StringVariable, Variable, VariableType } from "./variables";

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