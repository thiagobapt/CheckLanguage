import { StringVariable, Variable, VariableType } from "./variables";

export function printLn(variables: Variable[]) {
    let result = "";
    for(const variable of variables) {
        let stringValue = "";

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
}

export function concat(variables: Variable[]) {
    let result = "";
    for(const variable of variables) {
        let stringValue = "";

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