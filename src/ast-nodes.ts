import { Variable, VariableType } from "./variables";

// arquivo: ast-nodes.ts
export interface ASTNode {
    type: string;
    id: number;
    line: number;
    char: number;
  }
  
  export class BinaryOpNode implements ASTNode {
    id: number;
    line: number;
    char: number;
    constructor(
      public left: ASTNode,
      public operator: string,
      public right: ASTNode,
      line: number,
      char: number
    ) {
      this.id = ASTNodeCounter.getNextId();
      this.line = line;
      this.char = char;
    }
    type = "BinaryOp";
  }
  
  export class NumberNode implements ASTNode {
    id: number;
    line: number;
    char: number;
    constructor(public value: string, line: number, char: number) {
      this.id = ASTNodeCounter.getNextId();
      this.line = line;
      this.char = char;
    }
    type = "Number";
  }

  export class StringNode implements ASTNode {
    id: number;
    line: number;
    char: number;
    constructor(public value: string, line: number, char: number) {
      this.id = ASTNodeCounter.getNextId();
      this.line = line;
      this.char = char;
    }
    type = "String";
  }

  export class BooleanNode implements ASTNode {
    id: number;
    line: number;
    char: number;
    constructor(public value: string, line: number, char: number) {
      this.id = ASTNodeCounter.getNextId();
      this.line = line;
      this.char = char;
    }
    type = "Boolean";
  }

  export class ArrayNode implements ASTNode {
    id: number;
    line: number;
    char: number;
    constructor(public value: ASTNode[], line: number, char: number) {
      this.id = ASTNodeCounter.getNextId();
      this.line = line;
      this.char = char;
    }
    type = "Array";
  }

  export class IndexNode implements ASTNode {
    id: number;
    line: number;
    char: number;
    constructor(public value: ASTNode, public index: ASTNode, line: number, char: number) {
      this.id = ASTNodeCounter.getNextId();
      this.line = line;
      this.char = char;
    }
    type = "Array";
  }
  
  export class NameNode implements ASTNode {
    id: number;
    line: number;
    char: number;
    constructor(public value: string, line: number, char: number) {
      this.id = ASTNodeCounter.getNextId();
      this.line = line;
      this.char = char;
    }
    type = "Name";
  }

  export class ReturnNode implements ASTNode {
    id: number;
    line: number;
    char: number;
    constructor(public value: ASTNode, line: number, char: number) {
      this.id = ASTNodeCounter.getNextId();
      this.line = line;
      this.char = char;
    }
    type = "Return";
  }

  export class FunctionCallNode implements ASTNode {
    id: number;
    constructor(
      public value: string,
      public parameters: ASTNode[],
      public line: number,
      public char: number
    ) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "FunctionCall";
  }

  export class ParameterDeclarationNode implements ASTNode {
    id: number;
    constructor(
      public value: Variable,
      public name: NameNode,
      public param_type: VariableType,
      public line: number,
      public char: number
    ) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "ParameterDeclaration";
  }

  export class FunctionNode implements ASTNode {
    id: number;
    constructor(
      public value: string,
      public parameters: ParameterDeclarationNode[],
      public executeBranch: ASTNode[],
      public line: number,
      public char: number
    ) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "Function";
  }

  export class FunctionDeclarationNode implements ASTNode {
    id: number;
    constructor(
      public value: FunctionNode,
      public line: number,
      public char: number
    ) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "FunctionDeclaration";
  }

  export class InitializationNode implements ASTNode {
    id: number;
    constructor(
      public name: NameNode, 
      public value: ASTNode,
      public line: number,
      public char: number
    ) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "Initialization";
  }
  
  export class AssignmentNode implements ASTNode {
    id: number;
    constructor(
      public name: NameNode, 
      public value: ASTNode,
      public line: number,
      public char: number
    ) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "Assignment";
  }

  // Representa uma expressão condicional (ex.: x < 10)
  export class ConditionalNode implements ASTNode {
    id: number;
    constructor(
      public left: ASTNode,
      public operator: string,
      public right: ASTNode,
      public line: number,
      public char: number
    ) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "Conditional";
  }

  // Representa uma estrutura condicional if (ex.: if x < 10 then ...)
  export class IfNode implements ASTNode {
    id: number;
    constructor(
      public condition: ASTNode,
      public thenBranch: ASTNode[],
      public elseBranch: ASTNode[] | null = null,
      public line: number,
      public char: number
    ) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "If";
  }

  export class WhileNode implements ASTNode {
    id: number;
    constructor(
      public condition: ASTNode,
      public doBranch: ASTNode[],
      public line: number,
      public char: number
    ) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "While";
  }

  export class ForNode implements ASTNode {
    id: number;
    constructor(
      public index: ASTNode,
      public condition: ASTNode,
      public endStatement: ASTNode,
      public doBranch: ASTNode[],
      public line: number,
      public char: number
    ) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "For";
  }
  
  class ASTNodeCounter {
    private static currentId: number = 0;
    public static getNextId(): number {
      return ++this.currentId;
    }
  }
  