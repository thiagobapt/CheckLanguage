// arquivo: ast-nodes.ts
export interface ASTNode {
    type: string;
    id: number;
  }
  
  export class BinaryOpNode implements ASTNode {
    id: number;
    constructor(
      public left: ASTNode,
      public operator: string,
      public right: ASTNode
    ) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "BinaryOp";
  }
  
  export class NumberNode implements ASTNode {
    id: number;
    constructor(public value: string) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "Number";
  }
  
  export class NameNode implements ASTNode {
    id: number;
    constructor(public value: string) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "Name";
  }
  
  export class AssignmentNode implements ASTNode {
    id: number;
    constructor(public name: NameNode, public value: ASTNode) {
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
      public right: ASTNode
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
      public thenBranch: ASTNode,
      public elseBranch: ASTNode | null = null
    ) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "If";
  }

  export class WhileNode implements ASTNode {
    id: number;
    constructor(
      public condition: ASTNode,
      public doBranch: ASTNode,
    ) {
      this.id = ASTNodeCounter.getNextId();
    }
    type = "While";
  }
  
  class ASTNodeCounter {
    private static currentId: number = 0;
    public static getNextId(): number {
      return ++this.currentId;
    }
  }
  