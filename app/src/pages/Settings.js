import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import LogoutModal from "../components/LogoutModal";
import ToggleBtn from "../components/ToggleBtn";
import UpdateLoginForm from "../components/UpdateLoginForm";
import { setSettingsState } from "../modules/settings";
import { useHistory } from "react-router-dom";

/**
 * `/settings` 페이지 렌더링
 *
 * @return {JSX.Element} `/settings` 페이지를 구성하는 컴포넌트
 */
function Settings() {
  const { loginInfo } = useSelector((state) => state.loginReducer);
  const { userId, userName, email } = loginInfo;

  const [isChanged, setIsChanged] = useState(false); // 사용자 정보 변경창 열기
  const [isLogOut, setIsLogOut] = useState(false); // 로그아웃 창 열기

  const { settings } = useSelector((state) => state.settingsReducer);
  const dispatch = useDispatch();
  const history = useHistory();

  return (
    <>
      <section className="section settings">
        {/* 모니터링 설정 메뉴 */}
        <div className="container settings-section">
          <div className="settings-title">모니터링 설정</div>
          <hr />
          <div className="message-control">
            <span className="label">알림 메세지 설정</span>
            <ToggleBtn
              state={settings.alarmMsgOn}
              trigger={() =>
                dispatch(
                  setSettingsState({
                    ...settings,
                    alarmMsgOn: !settings.alarmMsgOn,
                  })
                )
              }
            />
          </div>
          <div className="alarm-control">
            <span className="label">경고음 설정</span>
            <ToggleBtn
              state={settings.alarmSoundOn}
              trigger={() =>
                dispatch(
                  setSettingsState({
                    ...settings,
                    alarmSoundOn: !settings.alarmSoundOn,
                  })
                )
              }
            />
          </div>
        </div>
        {/* 사용자 설정 메뉴 */}
        <div className="container user-section">
          <div className="settings-title">사용자 설정</div>
          <hr />
          <ul className="userInfo">
            <li>
              <span>관리자</span>
              <input type="text" value={userName} disabled />
            </li>
            <li>
              <span>계정 ID</span> <input type="text" value={userId} disabled />
            </li>
            <li>
              <span>관리자 이메일</span>
              <input type="text" value={email} disabled />
            </li>
          </ul>
          <div className="user-control">
            <button className="user-modify" onClick={() => setIsChanged(true)}>
              사용자 정보 변경
            </button>
            <button className="user-logout" onClick={() => setIsLogOut(true)}>
              로그아웃
            </button>
          </div>
        </div>
        {/* 사용자 정보 변경 */}
        {isChanged && (
          <UpdateLoginForm
            loginInfo={loginInfo}
            history={history}
            setIsChanged={setIsChanged}
          />
        )}
        {/* 로그아웃 */}
        {isLogOut && (
          <LogoutModal history={history} setIsLogOut={setIsLogOut} />
        )}
      </section>
    </>
  );
}
export default Settings;
