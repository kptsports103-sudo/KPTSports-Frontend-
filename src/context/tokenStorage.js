const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

const setAccessToken = (token) => {
  localStorage.setItem('accessToken', token);
};

export { getAccessToken, setAccessToken };