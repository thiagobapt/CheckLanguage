// parser.ts
import { Token, TokenType, Lexer } from "./lexer";
import { BinaryOpNode, NumberNode, NameNode, AssignmentNode, ASTNode, IfNode, ConditionalNode, WhileNode, ForNode, InitializationNode, StringNode, BooleanNode, FunctionCallNode, FunctionDeclarationNode, FunctionNode, ParameterDeclarationNode, ReturnNode, ArrayNode, IndexNode, IndexAssignmentNode } from "./ast-nodes";
import { BooleanVariable, NumberVariable, StringVariable, Variable, VariableType } from "./variables";

export class Parser {
  private currentToken!: Token;

  constructor(private readonly lexer: Lexer) {
    this.currentToken = this.lexer.getNextToken();
  }

  private eat(tokenType: TokenType): void {
    if (this.currentToken.type === tokenType) {
      this.lexer.setPreviousTokenType(tokenType);
      this.currentToken = this.lexer.getNextToken();
    } else {
      throw new Error(
        `Unexpected token: ${this.currentToken.type} (${this.currentToken.value}), expected: ${tokenType}. At line: ${this.lexer.getCurrentLine()}:${this.lexer.getCurrentLineChar()}`
      );
    }
  }

  private conditional_factor(): ASTNode {
    if(this.currentToken.type === TokenType.LeftParen) {
      this.eat(TokenType.LeftParen);
      const expr = this.conditional_expression();
      this.eat(TokenType.RightParen);
      return expr;
    }

    const left = this.expr();

    switch(this.currentToken.type) {

      case TokenType.EqualsEquals: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, "==", right, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
      }

      case TokenType.NotEquals: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, "!=", right, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
      }

      case TokenType.MoreThan: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, ">", right, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
      }

      case TokenType.LessThan: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, "<", right, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
      }

      case TokenType.MoreThanOrEquals: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, ">=", right, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
      }

      case TokenType.LessThanOrEquals: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, "<=", right, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
      }
    }

    return left;
  }

  private conditional_term(): ASTNode {
    let left = this.conditional_factor();

    while(
      this.currentToken.type === TokenType.And
    ) {
      this.eat(TokenType.And);
      left = new ConditionalNode(left, TokenType.And, this.conditional_factor(), this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
    }

    return left;
  }

  private conditional_expression(): ASTNode {
    let left = this.conditional_term();

    while(
      this.currentToken.type === TokenType.Or
    ) {
      this.eat(TokenType.Or);
      left = new ConditionalNode(left, TokenType.Or, this.conditional_term(), this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
    }

    return left;
  }
  
  private ifStatement(): ASTNode {
    
    this.eat(TokenType.If);
    
    this.eat(TokenType.LeftParen);
    const condition = this.conditional_expression(); // Parse da condição
    this.eat(TokenType.RightParen);
    
    this.eat(TokenType.LeftBracket);
    const thenBranch: ASTNode[] = this.statement_list();
    this.eat(TokenType.RightBracket);
  
    let elseBranch: ASTNode[] = [];
    if (this.currentToken.type === TokenType.Else) {
      this.eat(TokenType.Else);
      this.eat(TokenType.LeftBracket);
      elseBranch = this.statement_list();
      this.eat(TokenType.RightBracket);
    }
  
    return new IfNode(condition, thenBranch, elseBranch, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
  }

  private whileStatement(): ASTNode {
    this.eat(TokenType.While);
    
    this.eat(TokenType.LeftParen);
    const condition = this.conditional_expression(); // Parse da condição
    this.eat(TokenType.RightParen);

    this.eat(TokenType.LeftBracket);
    const doBranch: ASTNode[] = this.statement_list();;
    this.eat(TokenType.RightBracket);

    return new WhileNode(condition, doBranch, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
  }

  private forStatement(): ASTNode {
    this.eat(TokenType.For);
    
    this.eat(TokenType.LeftParen);
    const index = this.initialization();
    const condition = this.conditional_expression(); // Parse da condição
    this.eat(TokenType.Semicolon);
    const endStatement = this.statement();
    this.eat(TokenType.RightParen);

    this.eat(TokenType.LeftBracket);
    const doBranch: ASTNode[] = this.statement_list();
    this.eat(TokenType.RightBracket);

    return new ForNode(index, condition, endStatement, doBranch, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
  }
  
  // fim da parte nova

  private factor(): ASTNode {
    const token = this.currentToken;
    if (token.type === TokenType.Number) {

      this.eat(TokenType.Number);
      return new NumberNode(token.value, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());

    } else if (token.type === TokenType.Name) {

      this.eat(TokenType.Name);
      const nameNode = new NameNode(token.value, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());

      if(this.currentToken.type === TokenType.LeftSquareBracket) {
        this.eat(TokenType.LeftSquareBracket);
        const node = this.expr();
        this.eat(TokenType.RightSquareBracket);

        return new IndexNode(nameNode, node, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
      }

      return nameNode;

    } else if (token.type === TokenType.Function) {

      this.eat(TokenType.Function);
      this.eat(TokenType.LeftParen);
      const parameters = this.expression_list();
      this.eat(TokenType.RightParen);

      return new FunctionCallNode(token.value, parameters, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());

    } else if (token.type === TokenType.Quotation) {

      this.eat(TokenType.Quotation);
      const node = this.factor();
      this.eat(TokenType.CloseQuotation);

      return node;

    } else if (token.type === TokenType.String) {

      this.eat(TokenType.String);
      return new StringNode(token.value, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());

    } else if (token.type === TokenType.Boolean) {

      this.eat(TokenType.Boolean);
      return new BooleanNode(token.value, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());

    } else if (token.type === TokenType.LeftParen) {

      this.eat(TokenType.LeftParen);
      const node = this.expr();
      this.eat(TokenType.RightParen);
      return node;

    } else if (token.type === TokenType.LeftSquareBracket) {

      this.eat(TokenType.LeftSquareBracket);
      const nodes = this.expression_list();
      this.eat(TokenType.RightSquareBracket);

      const array = new ArrayNode(nodes, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());

      if(this.currentToken.type === TokenType.LeftSquareBracket) {
        return this.index(array);
      }

      return array;
    }
    throw new Error(`Invalid factor: ${token.value}. At line: ${this.lexer.getCurrentLine()}:${this.lexer.getCurrentLineChar()}`);
  }

  private term(): ASTNode {
    let node = this.factor();
    while (
      this.currentToken.type === TokenType.Multiply ||
      this.currentToken.type === TokenType.Divide ||
      this.currentToken.type === TokenType.Modulus
    ) {
      const token = this.currentToken;
      this.eat(token.type);
      node = new BinaryOpNode(node, token.value, this.factor(), this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
    }
    return node;
  }

  private expr(): ASTNode {
    let node = this.term();
    while (
      this.currentToken.type === TokenType.Plus ||
      this.currentToken.type === TokenType.Minus
    ) {
      const token = this.currentToken;
      this.eat(token.type);
      node = new BinaryOpNode(node, token.value, this.term(), this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
    }
    return node;
  }

  private index(previousNode: ASTNode): IndexNode {
    this.eat(TokenType.LeftSquareBracket);
    const indexNumber = this.expr();
    this.eat(TokenType.RightSquareBracket);
    
    let node = new IndexNode(previousNode, indexNumber, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
    
    if (
      this.currentToken.type === TokenType.LeftSquareBracket
    ) {
      return this.index(node);
    }
    
    return node;
  }

  private expression_list(): ASTNode[] {
    const expressions: ASTNode[] = [];
    while(
      this.currentToken.type == TokenType.Name ||
      this.currentToken.type == TokenType.Number ||
      this.currentToken.type == TokenType.String ||
      this.currentToken.type == TokenType.Quotation ||
      this.currentToken.type == TokenType.CloseQuotation ||
      this.currentToken.type == TokenType.LeftSquareBracket ||
      this.currentToken.type == TokenType.Boolean ||
      this.currentToken.type == TokenType.Function ||
      this.currentToken.type == TokenType.Comma
    ) {

      if(this.currentToken.type === TokenType.Comma) this.eat(TokenType.Comma);
      expressions.push(this.expr());

    }

    return expressions;
  }

  private parameters_declaration(): ParameterDeclarationNode[] {
    const params: ParameterDeclarationNode[] = [];
    while(
      this.currentToken.type == TokenType.Name ||
      this.currentToken.type == TokenType.Type ||
      this.currentToken.type == TokenType.Comma
    ) {
      const type = this.currentToken.value;
      if(this.currentToken.type === TokenType.Type) this.eat(TokenType.Type);
      let paramType: VariableType;
      let variable: Variable;
      switch(type) {
        case "string": {
          paramType = VariableType.String;
          variable = new StringVariable(undefined);
          break;
        }
        case "number": {
          paramType = VariableType.Number;
          variable = new NumberVariable(undefined);
          break;
        }
        case "boolean": {
          paramType = VariableType.Boolean;
          variable = new BooleanVariable(undefined);
          break;
        }
        case "array": {
          paramType = VariableType.Array;
          variable = new BooleanVariable(undefined);
          break;
        }
        default: {
          throw new Error("Invalid type");
        }
      }
      const name = this.currentToken.value;
      if(this.currentToken.type === TokenType.Name) this.eat(TokenType.Name);
      if(this.currentToken.type === TokenType.Comma) this.eat(TokenType.Comma);
      params.push(new ParameterDeclarationNode(variable, new NameNode(name, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar()), paramType, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar()));
    }
    return params;
  }

  private assignment(): ASTNode {
    const variableToken = this.currentToken;
    this.eat(TokenType.Name);
    this.eat(TokenType.Equals);
    const exprNode = this.expr();
    this.eat(TokenType.Semicolon);
    return new AssignmentNode(new NameNode(variableToken.value, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar()), exprNode, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
  }

  private index_assignment(): ASTNode {
    const variableToken = this.currentToken;
    this.eat(TokenType.Name);

    const indexes: ASTNode[] = []

    while(
      this.currentToken.type === TokenType.LeftSquareBracket ||
      this.currentToken.type === TokenType.RightSquareBracket ||
      this.currentToken.type === TokenType.Number
    ) {
      this.eat(TokenType.LeftSquareBracket);
      const index = this.expr();
      this.eat(TokenType.RightSquareBracket);
      indexes.push(index);
    }

    this.eat(TokenType.Equals);
    const exprNode = this.expr();
    this.eat(TokenType.Semicolon);

    return new IndexAssignmentNode(new NameNode(variableToken.value, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar()), exprNode, indexes, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
  }

  private initialization(): ASTNode {
    this.eat(TokenType.Var);
    const variableToken = this.currentToken;
    this.eat(TokenType.Name);
    this.eat(TokenType.Equals);
    const exprNode = this.expr();
    this.eat(TokenType.Semicolon);
    return new InitializationNode(new NameNode(variableToken.value, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar()), exprNode, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
  }

  private return_statement(): ASTNode {
    this.eat(TokenType.Return);
    const node = this.statement();
    return new ReturnNode(node, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
  }

  private functionDeclaration(): ASTNode {
    this.eat(TokenType.FunctionDeclaration);
    const nameToken = this.currentToken;
    this.eat(TokenType.Name);
    this.eat(TokenType.LeftParen);
    const parameters = this.parameters_declaration();
    this.eat(TokenType.RightParen);
    this.eat(TokenType.LeftBracket);
    const execBranch: ASTNode[] = this.statement_list();
    this.eat(TokenType.RightBracket);
    return new FunctionDeclarationNode(new FunctionNode(nameToken.value, parameters, execBranch, this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar()), this.lexer.getCurrentLine(), this.lexer.getCurrentLineChar());
  }

  public statement_list(): ASTNode[] {
    const statements: ASTNode[] = [];
    let hasReturnStatement = false;
    while(
      this.currentToken.type == TokenType.If ||
      this.currentToken.type == TokenType.While ||
      this.currentToken.type == TokenType.For ||
      this.currentToken.type == TokenType.Name ||
      this.currentToken.type == TokenType.Function ||
      this.currentToken.type == TokenType.Var ||
      this.currentToken.type == TokenType.FunctionDeclaration ||
      this.currentToken.type == TokenType.Return
      
    ) {
      if(hasReturnStatement) throw new Error(`${this.currentToken.value} is unreacheable! At line: ${this.lexer.getCurrentLine()}:${this.lexer.getCurrentLineChar()}`);
      if(this.currentToken.type === TokenType.Return) hasReturnStatement = true;
      statements.push(this.statement());
    }
    return statements;
  }

  public statement(): ASTNode {
    if (this.currentToken.type === TokenType.If) {
      return this.ifStatement();
    } else if (this.currentToken.type === TokenType.While) {
      return this.whileStatement();
    } else if (this.currentToken.type === TokenType.For) {
      return this.forStatement();
    }
    else if(this.currentToken.type === TokenType.FunctionDeclaration) {
      return this.functionDeclaration();
    }
    else if (this.currentToken.type === TokenType.Name) {
      const nextToken = this.lexer.lookAhead();
      
      if (nextToken.type === TokenType.Equals) {
        return this.assignment();
      } else if(nextToken.type === TokenType.LeftSquareBracket) {
        return this.index_assignment();
      }
    }
    else if (this.currentToken.type === TokenType.Var) {
      return this.initialization();
    }
    else if (this.currentToken.type === TokenType.Return) {
      return this.return_statement();
    }

    const node = this.expr();

    this.eat(TokenType.Semicolon);

    return node;
  }

  public parse(): ASTNode {
    return this.statement();
  }
}

