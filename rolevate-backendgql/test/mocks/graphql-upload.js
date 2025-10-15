// Mock for graphql-upload
const GraphQLUpload = {
  name: 'Upload',
  description: 'The `Upload` scalar type represents a file upload.',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => ast,
};

module.exports = GraphQLUpload;
module.exports.default = GraphQLUpload;
