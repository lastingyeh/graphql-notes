# GraphQL

### 流程
---

    s1. Client 發送 Request

    s2. Server 接收

    s3. 對應 Service 路徑，解析 POST req.body

    s4. Server Schema 對應，包含 [結構, 參數型別, 查詢名稱, 回傳欄位..]

    s5. 呼叫 相對應 Resolvers 回應 Client

### 特色 
---

    1. 完整支援 NodeJS Express 架構

    2. 單一查詢路徑 （配合 req.body 取得相對應操作)

    3. 一率採 'POST' 方法

    4. Client 彈性 定義所需 方法 參數 以及回傳欄位

### Schema 結構
---

完整 Schema 定義內容

```javascript
const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type Post {
    _id:ID!
    title:String!
    content:String!
    imageUrl:String!
    creator:User!
    createdAt:String!
    updatedAt:String!
  }

  type User {
    _id:ID!
    name:String!
    email:String!
    password:String
    status:String!
    posts:[Post!]!
  }

  input UserInputData {
    email:String!
    name:String!
    password:String!
  }

  type RootQuery {
    hello: String
  }

  type RootMutation {
    createUser(userInput: UserInputData):User!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
```

拆解說明

1. 定義 API 大類 (Layer1)

        schema {
          query: RootQuery
          mutation: RootMutation
        }


2. 定義 API 方法 (Layer2)

        type RootQuery {
          login(email:String!, password:String!):AuthData!
          posts(page: Int):PostData!
          post(id:ID!):Post!
          user: User!
        }

        type RootMutation {
          createUser(userInput: UserInputData):User!
          createPost(postInput: PostInputData):Post!
          updatePost(id:ID!, postInput:PostInputData):Post!
          deletePost(id:ID!):Boolean
          updateStatus(status:String!):User!
        }

3. 定義 以上各項定義參數以及回傳型別

* 參數

      input UserInputData {
        email:String!
        name:String!
        password:String!
      }

      input PostInputData {
        title:String!
        content:String!
        imageUrl:String!
      }

* 回傳型別

      type Post {
        _id:ID!
        title:String!
        content:String!
        imageUrl:String!
        creator:User!
        createdAt:String!
        updatedAt:String!
      }

      type User {
        _id:ID!
        name:String!
        email:String!
        password:String
        status:String!
        posts:[Post!]!
      }

      type AuthData {
        token:String!
        userId:String!
      }

      type PostData {
        posts:[Post!]!
        totalPosts:Int!
      }

### Resolvers 定義
---
根據 Layer1 定義方法實作函數(自動回應 Json 格式)

### 快速開發測試(graphiql)
---

1. 安裝 express-graphql 

        npm install express-graphql

2. 加入對應 schema, resolvers 參數

3. 載入 express middleware

4. 參數設定 { graphiql: true } (相關範例如下)

```javascript

app.use(
  '/graphql',
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      
      const data = err.originalError.data;
      const message = err.message || 'An error occured.';
      const code = err.originalError.code || 500;

      return { message, status: code, data };
    },
  }),
);
```
5. 瀏覽器輸入 localhost:8080/graphql 即可開始測試

### Postman 測試

---

基本語法皆可使用上述 graphiql 直接測試，但若有以下需求則必須使用 Postman 處理較方便

1. header 設定

2. token 加入

3. formdata 運用

但是因為查詢語法不易撰寫，故可以在 graphiql 設定後再將查詢語法 import 到 Postman 進行測試

[1. 操作說明 How to send graphql query by postman?](https://stackoverflow.com/questions/42520663/how-to-send-graphql-query-by-postman)

[2. 提供本測試專案所有 Postman 匯入檔](https://github.com/lastingyeh/graphql-notes/blob/master/postman-apis.json)

### 參考資料

---

1. [Graphql 官方網站](https://graphql.org/)

2. [Udemy 課程：NodeJS - The Complete Guide (incl. MVC, REST APIs, GraphQL) - GraphQL](https://www.udemy.com/nodejs-the-complete-guide/)







