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

    1. 完整搭配 NodeJS Express 架構

    2. 單一查詢路徑 （配合 req.body 取得相對應操作)

    3. 一率採 'POST' 方法

    4. Client 彈性 定義所需 方法 參數 以及回傳欄位

### Schema 結構
---

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
	
1. 定義 API 大類 (第一層)

```json
schema {
  query: RootQuery
  mutation: RootMutation
}
```

2. 定義 API 方法 (第二層)

```json
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

```

3. 定義 以上各項定義參數以及回傳型別

* 參數
 ```json
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

 ```

* 回傳型別
```json
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
```

### Resolvers 定義
---
根據以上第一層所定義方法定義同名實作函數

### 查詢測試 (Node Express)
---

1. npm install express-graphql

2. 取得上述 schema, resolvers

3. 載入 express middleware

4. 參數內設定 graphiql: true ( 相關範例如下)

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

### POSTMAN 測試

---

基本語法皆可使用上述 graphiql直接測試，但若有以下需求則必須使用 Postman處理較方便

1. header 設定

2. token 加入

3. formdata 運用

但是因為查詢語法不易撰寫，故可以在graphiql設定後再將查詢語法 import 到 Postman進行測試

[操作說明 How to send graphql query by postman?](https://stackoverflow.com/questions/42520663/how-to-send-graphql-query-by-postman)

[提供本測試專案所有 Postman 匯入檔]

### 參考資料

---

1. [Graphql 官方網站](https://graphql.org/)

2. [Udemy 課程：NodeJS - The Complete Guide (incl. MVC, REST APIs, GraphQL) - GraphQL](https://www.udemy.com/nodejs-the-complete-guide/)






