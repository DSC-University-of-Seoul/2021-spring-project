import axios from "axios";

/**
 * 등록할 사용자 정보를 기반으로 사용자 회원가입을 진행
 *
 * @param {Object} registerInfo - 등록할 사용자 정보
 */
export const postUserRegister = async (registerInfo) => {
  try {
    await axios.post(
      `${process.env.REACT_APP_API_SERVER}/api/auth/register`,
      registerInfo
    );
  } catch (e) {
    throw e;
  }
};
