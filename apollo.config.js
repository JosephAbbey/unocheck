module.exports = {
  client: {
    service: {
      url: "http://localhost:3000/api/graphql",
      localSchemaFile: "./generated/schema.graphql"
    },
    includes: ["./**/*.ts", "./**/*.tsx"]
  }
}
