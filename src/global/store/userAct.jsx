import { userActions } from "./userReducers";

export const logout = () => (dispatch) => {
  dispatch(userActions.resetUserInfo());
  localStorage.removeItem("account");
  localStorage.removeItem("userInfo");
};
