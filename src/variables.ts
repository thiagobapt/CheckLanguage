export enum VariableType {
    Number = "NUMBER",
    String = "STRING",
    Boolean = "BOOLEAN",
    Null = "NULL"
}

export class NumberVariable {
    public name: string;
    public type: VariableType.Number = VariableType.Number;
    public value: number;

    constructor(value: number, name: string = "") {
        this.name = name;
        this.value = value;
    }
}

export class StringVariable {
    public name: string;
    public type: VariableType.String = VariableType.String;
    public value: string;

    constructor(value: string, name: string = "") {
        this.name = name;
        this.value = value;
    }
}

export class BooleanVariable {
    public name: string;
    public type: VariableType.Boolean = VariableType.Boolean;
    public value: boolean;

    constructor(value: boolean, name: string = "") {
        this.name = name;
        this.value = value;
    }
}

export class NullVariable {
    public name: string;
    public type: VariableType.Null = VariableType.Null;
    public value: null = null;

    constructor(name: string = "") {
        this.name = name;
    }
}

export type Variable = NumberVariable | StringVariable | NullVariable | BooleanVariable;