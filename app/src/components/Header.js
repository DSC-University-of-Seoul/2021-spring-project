import { FaBell, FaUser } from "react-icons/fa";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";

import { Link } from "react-router-dom";
import LogoutModal from "./LogoutModal";
import UpdateLoginForm from "./UpdateLoginForm";
import { loadSettingsState } from "../modules/settings";
import useLocalStorage from "../hooks/useLocalStorage";

/**
 * 홈페이지 헤더부 구성
 *
 * @param {Object} props history: 리다이렉션을 위한 history 객체
 * @returns {JSX.Element} 홈페이지 헤더부 컴포넌트
 */

function Header({ history }) {
  const ONE_HOUR = 3600000;
  const [date, setDate] = useState(null); // 날짜·시간 정보 저장

  const initMenuOpen = useMemo(
    () => ({
      alarm: false,
      user: false,
    }),
    []
  );
  const [menuOpen, setMenuOpen] = useState(initMenuOpen); // 헤더 메뉴 열기
  const [isChanged, setIsChanged] = useState(false); // 사용자 정보 변경
  const [isLogOut, setIsLogOut] = useState(false); // 사용자 로그아웃

  const { loginInfo } = useSelector((state) => state.loginReducer);
  const {
    data: { newLogsData },
  } = useSelector((state) => state.logsReducer);

  // 이미 읽은 신규 알림 로그 ID
  const [readAlarmsId, setReadAlarmsId] = useLocalStorage("readAlarms", []);

  // 읽지 않은 알림 로그
  const [unreadLogs, setunreadLogs] = useState([]);

  useEffect(() => {
    // 읽지 않은 알림 로그 필터링
    setunreadLogs(
      newLogsData.filter(
        (data) =>
          !readAlarmsId.find(
            (element) => String(element) === String(data.anomaly_log_id)
          )
      )
    );

    // 신규 로그가 생성되는 한 시간마다 초기화 (선택 시 시간 연장됨)
    const readLogsIdClear = setTimeout(() => {
      setReadAlarmsId([]);
    }, ONE_HOUR);

    return () => clearInterval(readLogsIdClear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newLogsData, readAlarmsId]);

  // 날짜·시간 포맷팅 (yyyy-mm-dd hh:mm:ss)
  const format = useCallback((timeInfo) => {
    Object.keys(timeInfo).forEach((key) => {
      timeInfo[key] =
        timeInfo[key] < 10
          ? "0" + String(timeInfo[key])
          : String(timeInfo[key]);
    });
    return timeInfo;
  }, []);

  //  날짜·시간 표기 함수 (1초 마다 비동기 처리)
  useEffect(() => {
    const getTime = setInterval(() => {
      const time = new Date();
      const timeInfo = {
        year: time.getFullYear(),
        month: time.getMonth() + 1,
        day: time.getDate(),
        hours: time.getHours(),
        minutes: time.getMinutes(),
        seconds: time.getSeconds(),
      };
      setDate(format(timeInfo));
    }, 1000);

    return () => clearInterval(getTime);
  });

  // 헤더 메뉴 닫기
  useEffect(() => {
    const menuClick = () => setMenuOpen(initMenuOpen);
    window.addEventListener("click", menuClick);

    return () => window.removeEventListener("click", menuClick);
  }, [initMenuOpen]);

  // 언마운트 시 history 객체 반환
  useEffect(() => {
    return history;
  }, [history]);

  // 알람 로그 클릭 이벤트 (읽음 처리)
  const clickNewLogAlarm = useCallback(
    (e) => {
      let target = e.target.closest("li");

      if (!target.dataset.id) return;
      const readId = target.dataset.id;

      // 이미 존재하는 경우 무시 => 다중 입력 방지
      if (readAlarmsId.find((data) => data === readId)) return;
      setReadAlarmsId([...readAlarmsId, readId]);
    },
    [readAlarmsId, setReadAlarmsId]
  );

  // 알림 메세지, 알림음 설정으로 헤더 메뉴 설정
  const { settings } = useSelector((state) => state.settingsReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadSettingsState());
  }, [dispatch]);

  // 신규 로그 발생 시 알람음 재생 (알림음 재생 설정 시에만)
  const audioRef = useRef();
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    return () => newLogsData;
  }, [newLogsData]);

  return (
    <>
      <header>
        <div className="logo" />
        <div className="info">
          <div
            className={`newLogs-info${
              unreadLogs.length !== 0 && settings.alarmMsgOn
                ? " logs-unread"
                : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {unreadLogs.length !== 0 && settings.alarmSoundOn && (
              <audio src="src/assets/sound/alarm.mp3" autoPlay ref={audioRef} />
            )}
            <FaBell
              className="header-icon"
              onClick={() =>
                setMenuOpen({ ...initMenuOpen, alarm: !menuOpen.alarm })
              }
            />
            {/* 신규 로그 발생 확인 메뉴 */}
            {menuOpen.alarm && (
              <>
                <div className="arrow-up" />
                <ul
                  className="arrowbox-menu alarm-menu"
                  onClick={clickNewLogAlarm}
                >
                  {unreadLogs.length === 0 || !settings.alarmMsgOn ? (
                    <li>새로운 로그 정보가 없습니다.</li>
                  ) : (
                    unreadLogs.map((data) => (
                      <li
                        data-id={data.anomaly_log_id}
                        key={data.anomaly_log_id}
                      >
                        <span>{data.center_name}</span>에서
                        <br /> <span>{data.anomaly_type}</span>이 발생했습니다.
                      </li>
                    ))
                  )}
                </ul>
              </>
            )}
          </div>
          <div className="user-info" onClick={(e) => e.stopPropagation()}>
            <FaUser
              className="header-icon"
              onClick={() =>
                setMenuOpen({ ...initMenuOpen, user: !menuOpen.user })
              }
            />
            {/* 사용자 헤더 메뉴 */}
            {menuOpen.user && (
              <ul className="arrowbox-menu">
                <li>
                  <Link to="/settings">
                    <span>{loginInfo.userName}</span> 님
                  </Link>
                </li>
                <li onClick={() => setIsChanged(true)}>사용자 정보 변경</li>
                <li onClick={() => setIsLogOut(true)}>로그아웃</li>
              </ul>
            )}
          </div>
          <div className="time-info">
            <div>{date && `${date.year}-${date.month}-${date.day}`}</div>
            <div>{date && `${date.hours}:${date.minutes}:${date.seconds}`}</div>
          </div>
        </div>
      </header>
      {/* 사용자 정보 변경 */}
      {isChanged && (
        <UpdateLoginForm
          loginInfo={loginInfo}
          history={history}
          setIsChanged={setIsChanged}
        />
      )}
      {/* 로그아웃 창 */}
      {isLogOut && <LogoutModal history={history} setIsLogOut={setIsLogOut} />}
    </>
  );
}
export default Header;
