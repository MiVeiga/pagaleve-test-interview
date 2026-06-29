export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      access_token
      refresh_token
    }
  }
`;

export const USER_BY_ID_QUERY = `
  query User($id: ID!) {
    user(id: $id) {
      id
      name
      email
      avatar
    }
  }
`;
