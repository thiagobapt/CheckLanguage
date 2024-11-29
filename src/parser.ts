// parser.ts
import { Token, TokenType, Lexer } from "./lexer";
import { BinaryOpNode, NumberNode, NameNode, AssignmentNode, ASTNode, IfNode, ConditionalNode, WhileNode, ForNode, InitializationNode, StringNode, BooleanNode, FunctionCallNode, FunctionDeclarationNode, FunctionNode, ParameterDeclarationNode, ReturnNode, ArrayNode } from "./ast-nodes";
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
        `Unexpected token: ${this.currentToken.type} (${this.currentToken.value}), expected: ${tokenType}`
      );
    }
  }

  // parte nova 
  private conditional(): ASTNode {
    const left = this.expr();

    switch(this.currentToken.type) {

      case TokenType.EqualsEquals: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, "==", right);
      }

      case TokenType.NotEquals: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, "!=", right);
      }

      case TokenType.MoreThan: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, ">", right);
      }

      case TokenType.LessThan: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, "<", right);
      }

      case TokenType.MoreThanOrEquals: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, ">=", right);
      }

      case TokenType.LessThanOrEquals: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, "<=", right);
      }

      case TokenType.And: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, "&&", right);
      }

      case TokenType.Or: {
        this.eat(this.currentToken.type);
        const right = this.expr();
        return new ConditionalNode(left, "||", right);
      }

    }

    return left;
  }
  
  private ifStatement(): ASTNode {
    
    this.eat(TokenType.If);
    
    this.eat(TokenType.LeftParen);
    const condition = this.conditional(); // Parse da condição
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
  
    return new IfNode(condition, thenBranch, elseBranch);
  }

  private whileStatement(): ASTNode {
    this.eat(TokenType.While);
    
    this.eat(TokenType.LeftParen);
    const condition = this.conditional(); // Parse da condição
    this.eat(TokenType.RightParen);

    this.eat(TokenType.LeftBracket);
    const doBranch: ASTNode[] = this.statement_list();;
    this.eat(TokenType.RightBracket);

    return new WhileNode(condition, doBranch);
  }

  private forStatement(): ASTNode {
    this.eat(TokenType.For);
    
    this.eat(TokenType.LeftParen);
    const index = this.initialization();
    const condition = this.conditional(); // Parse da condição
    this.eat(TokenType.Semicolon);
    const endStatement = this.statement();
    this.eat(TokenType.RightParen);

    this.eat(TokenType.LeftBracket);
    const doBranch: ASTNode[] = this.statement_list();
    this.eat(TokenType.RightBracket);

    return new ForNode(index, condition, endStatement, doBranch);
  }
  
  // fim da parte nova

  private factor(): ASTNode {
    const token = this.currentToken;
    if (token.type === TokenType.Number) {
      this.eat(TokenType.Number);
      return new NumberNode(token.value);
    } else if (token.type === TokenType.Name) {
      this.eat(TokenType.Name);
      return new NameNode(token.value);
    } else if (token.type === TokenType.Function) {

      this.eat(TokenType.Function);
      this.eat(TokenType.LeftParen);
      const parameters = this.expression_list();
      this.eat(TokenType.RightParen);

      return new FunctionCallNode(token.value, parameters);

    } else if (token.type === TokenType.Quotation) {

      this.eat(TokenType.Quotation);
      const node = this.factor();
      this.eat(TokenType.CloseQuotation);

      return node;

    } else if (token.type === TokenType.String) {
      this.eat(TokenType.String);
      return new StringNode(token.value);
    } else if (token.type === TokenType.Boolean) {
      this.eat(TokenType.Boolean);
      return new BooleanNode(token.value);
    } else if (token.type === TokenType.LeftParen) {
      this.eat(TokenType.LeftParen);
      const node = this.expr();
      this.eat(TokenType.RightParen);
      return node;
    } else if (token.type === TokenType.LeftSquareBracket) {
      this.eat(TokenType.LeftSquareBracket);
      const nodes = this.expression_list();
      this.eat(TokenType.RightSquareBracket);
      return new ArrayNode(nodes);
    }
    throw new Error(`Invalid factor: ${token.value}`);
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
      node = new BinaryOpNode(node, token.value, this.factor());
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
      node = new BinaryOpNode(node, token.value, this.term());
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
      params.push(new ParameterDeclarationNode(variable, new NameNode(name), paramType));
    }
    return params;
  }

  private assignment(): ASTNode {
    const variableToken = this.currentToken;
    this.eat(TokenType.Name);
    this.eat(TokenType.Equals);
    const exprNode = this.expr();
    this.eat(TokenType.Semicolon);
    return new AssignmentNode(new NameNode(variableToken.value), exprNode);
  }

  private initialization(): ASTNode {
    this.eat(TokenType.Var);
    const variableToken = this.currentToken;
    this.eat(TokenType.Name);
    this.eat(TokenType.Equals);
    const exprNode = this.expr();
    this.eat(TokenType.Semicolon);
    return new InitializationNode(new NameNode(variableToken.value), exprNode);
  }

  private return_statement(): ASTNode {
    this.eat(TokenType.Return);
    const exprNode = this.expr();
    this.eat(TokenType.Semicolon);
    return new ReturnNode(exprNode);
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
    return new FunctionDeclarationNode(new FunctionNode(nameToken.value, parameters, execBranch));
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
      if(hasReturnStatement) throw new Error(`${this.currentToken.value} is unreacheable!`);
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
      }
    }
    else if (this.currentToken.type === TokenType.Var) {
      return this.initialization();
    }
    else if (this.currentToken.type === TokenType.Return) {
      return this.return_statement();
    }
    return this.expr();
  }

  public parse(): ASTNode {
    return this.statement();
  }
}

