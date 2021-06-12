import { FaBell, FaUser } from "react-icons/fa";
import React, { useCallback, useEffect, useState } from "react";

function Header() {
  const [date, setDate] = useState(null);

  const format = useCallback((timeInfo) => {
    Object.keys(timeInfo).forEach((key) => {
      timeInfo[key] =
        timeInfo[key] < 10
          ? "0" + String(timeInfo[key])
          : String(timeInfo[key]);
    });
    return timeInfo;
  }, []);

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
      console.log(time.getDay());

      setDate(format(timeInfo));
    }, 1000);

    return () => clearInterval(getTime);
  });

  return (
    <header>
      <div className="logo" />
      <div className="info">
        <div className="center-info">
          <FaBell />
        </div>
        <div className="user-info">
          <FaUser />
        </div>
        <div className="time-info">
          <div>{date && `${date.year}-${date.month}-${date.day}`}</div>
          <div>{date && `${date.hours}:${date.minutes}:${date.seconds}`}</div>
        </div>
      </div>
    </header>
  );
}
export default Header;
