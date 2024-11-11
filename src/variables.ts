export enum VariableType {
    Number = "NUMBER",
    String = "STRING",
    Boolean = "BOOLEAN",
    Null = "NULL"
}

export class NumberVariable {
    public name: string;
    public type: VariableType.Number = VariableType.Number;
    public value: number | undefined;

    constructor(value: number | undefined, name: string = "") {
        this.name = name;
        this.value = value;
    }
}

export class StringVariable {
    public name: string;
    public type: VariableType.String = VariableType.String;
    public value: string | undefined;

    constructor(value: string | undefined, name: string = "") {
        this.name = name;
        this.value = value;
    }
}

export class BooleanVariable {
    public name: string;
    public type: VariableType.Boolean = VariableType.Boolean;
    public value: boolean | undefined;

    constructor(value: boolean | undefined, name: string = "") {
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