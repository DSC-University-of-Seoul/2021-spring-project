import axios from "axios";

const SET_GEOJSON_DATA = "mapboxEvent/SET_GEOJSON_DATA";
const SET_HOVER_INFO = "mapboxEvent/SET_HOVER_INFO";
const SIDO_CLICK = "mapboxEvent/SIDO_CLICK";
const SGG_CLICK = "mapboxEvent/SGG_CLICK";
const RESET_TO_SIDO_DISTRICT = "mapboxEvent/RESET_TO_SIDO_DISTRICT";
const RESET_TO_SGG_DISTRICT = "mapboxEvent/RESET_TO_SGG_DISTRICT";
const MARKER_Click = "mapboxEvent/MARKER_Click";
const ERROR = "mapboxEvent/ERROR";

/**
 * 전달받은 geojsonData를 상태에 반영하는 액션함수
 *
 * @param {JSON} geojsonData 행정구역 geojson 데이터
 */
export const setGeojsonData = (geojsonData) => (dispatch) => {
  dispatch({ type: SET_GEOJSON_DATA, payload: geojsonData });
};

/**
 * 도, 광역시 hover 이벤트를 처리하는 액션함수
 * - 도, 광역시 관련 popupInfo를 생성하여 상태에 반영
 *
 * @param {Object} e hover 이벤트 객체
 */
export const sidoHover = (e) => (dispatch) => {
  const hoverArea = e.features[0];
  const sidoCount = hoverArea.properties.sido_cnt;
  /*
   * popupInfo : hover 이벤트를 통한 팝업 정보
   *
   * - longitude : hover 중인 위도
   * - latitude : hover 중인 경도
   * - districtName : hover 중인 지역구 이름
   * - districtCode : hover 중인 지역구 코드
   * - districtCount : hover 중인 지역구 어린이집 개수
   */
  const popupInfo = {
    longitude: e.lngLat[0],
    latitude: e.lngLat[1],
    districtName: hoverArea.properties.sidonm,
    districtCode:
      hoverArea.properties.sido && hoverArea.properties.sido + "00000000",
    districtCount: sidoCount !== "null" ? sidoCount : 0,
  };
  dispatch({ type: SET_HOVER_INFO, payload: popupInfo });
};
/**
 * 시,군,구 hover 이벤트를 처리하는 액션함수
 * - 시,군,구 관련 popupInfo를 생성하여 상태에 반영
 *
 * @param {Object} e hover 이벤트 객체
 */
export const sggHover = (e) => (dispatch) => {
  const hoverArea = e.features[0];
  const sggCount = hoverArea.properties.sgg_cnt;

  const popupInfo = {
    longitude: e.lngLat[0],
    latitude: e.lngLat[1],
    districtName: hoverArea.properties.sggnm,
    districtCode:
      hoverArea.properties.sgg && hoverArea.properties.sgg + "00000",
    districtCount: sggCount !== "null" ? sggCount : 0,
  };
  dispatch({ type: SET_HOVER_INFO, payload: popupInfo });
};
/**
 * 도, 광역시 클릭 이벤트를 처리하는 액션함수
 * - 도, 광역시 코드에 기반해 속해있는 시,군,구 구역 데이터를 Fetch
 * - 도, 광역시 내에 속해있는 시,군,구 geojson 데이터 필터링
 * - 필터링한 geojson 데이터를 상태에 반영
 *
 * @param {Object} geojsonData 행정구역 geojson 데이터
 * @param {Object} selectedDistrictInfo hover 중인 영역의 정보 (지역명, 코드)
 */
export const sidoClick =
  (geojsonData, selectedDistrictInfo) => async (dispatch) => {
    try {
      const geojson = {
        type: "FeatureCollection",
        features: [],
      };

      // 도, 광역시 코드에 기반해 속해있는 시,군,구 구역 데이터를 Fetch
      const sggsDistrictData = await axios.get(
        `${process.env.REACT_APP_API_SERVER}/api/districts?parent_code=${selectedDistrictInfo.code}`
      );
      // 도, 광역시 내에 속해있는 시,군,구 geojson 데이터 필터링
      const sggsFeatures = geojsonData.features.filter(
        (data) => data.properties.sidonm === selectedDistrictInfo.name
      );
      // geojson 데이터에 시,군,구 어린이집 개수(sgg_cnt) 정보 저장
      sggsFeatures.forEach((sggFeatures) => {
        sggsDistrictData.data.forEach((sggDistrictData) => {
          if (sggFeatures.properties.sggnm === sggDistrictData.district_name)
            sggFeatures.properties.sgg_cnt = parseInt(
              sggDistrictData.count,
              10
            );
        });
        if (!sggFeatures.properties.sgg_cnt) sggFeatures.properties.sgg_cnt = 0;
      });

      // 필터링한 geojson 데이터를 상태에 반영하고 레벨을 시,군,구 기준으로 변경
      geojson.features = sggsFeatures;
      dispatch({
        type: SIDO_CLICK,
        payload: { geojson, sidoName: selectedDistrictInfo.name },
      });
    } catch (e) {
      dispatch({ type: ERROR, payload: e });
    }
  };

/**
 * 시,군,구 클릭 이벤트를 처리하는 액션함수
 * - 시,군,구 코드에 기반해 어린이집 데이터를 Fetch
 * - Fetch한 어린이집 데이터를 상태에 반영
 *
 * @param {Object} selectedDistrictInfo hover 중인 영역의 정보 (지역명, 코드)
 */
export const sggClick = (selectedDistrictInfo) => async (dispatch) => {
  try {
    // 시,군,구 코드에 기반해 어린이집 데이터를 Fetch
    const fetchCdrCenter = await axios.get(
      `${process.env.REACT_APP_API_SERVER}/api/centers?district_code=${selectedDistrictInfo.code}`
    );

    // 이상행동 건수가 있는 어린이집만 체크
    const anomalyCdrCenter = fetchCdrCenter.data.filter(
      (data) => data.anomaly_count > 0
    );

    dispatch({
      type: SGG_CLICK,
      payload: {
        cdrCenters: anomalyCdrCenter,
        sggName: selectedDistrictInfo.name,
      },
    });
  } catch (e) {
    dispatch({ type: ERROR, payload: e });
  }
};
/**
 * 리셋 버튼 클릭 이벤트를 처리하는 액션함수
 * - 도, 광역시 기준 geojson 데이터 반영
 * - 도, 광역시 기준 level 변경
 * - 어린이집 정보 제거
 *
 * @param {Object} selectedDistrictInfo hover 중인 영역의 정보 (지역명, 코드)
 */
export const resetToSidoDistrict = (geojson) => ({
  type: RESET_TO_SIDO_DISTRICT,
  payload: geojson,
});

export const resetToSggDistrict = (geojson, sidoName) => ({
  type: RESET_TO_SGG_DISTRICT,
  payload: { geojson, sidoName },
});

/**
 * 마커 클릭 이벤트를 처리하는 액션함수
 * - 어린이집 정보를 팝업 정보 저장
 *
 * @param {Object} markerInfo 선택한 어린이집의 정보
 */
export const markerClick = (markerInfo) => async (dispatch) => {
  const popupInfo = {
    longitude: markerInfo.longitude,
    latitude: markerInfo.latitude,
    districtName: markerInfo.center_name,
    districtCode: markerInfo.district_code,
    assualtCount: markerInfo.assualt_count,
    fightCount: markerInfo.fight_count,
    swoonCount: markerInfo.swoon_count,
    anomalyCount: markerInfo.anomaly_count,
  };
  dispatch({ type: MARKER_Click, payload: popupInfo });
};

const initialState = {
  data: {
    level: 1,
    popupInfo: null,
    sidoName: "",
    sggName: "",
    geojsonData: null,
    cdrCentersInfo: null,
  },
  error: null,
};

/**
 * 액션 타입에 따라 상태를 업데이트하는 리듀서 함수
 *
 * @param {Object} state : 변경할 상태
 * @param {Object} action : 수행할 리듀서 동작을 지정하는 액션 객체
 * @return {Object} 변경된 상태
 */
export default function mapboxEventReducer(state = initialState, action) {
  switch (action.type) {
    // geojson 데이터 설정
    case SET_GEOJSON_DATA:
      return {
        data: {
          ...state.data,
          geojsonData: action.payload,
          cdrCentersInfo: null,
        },
        error: null,
      };
    // 지역구 hover 이벤트
    case SET_HOVER_INFO:
      return {
        data: {
          ...state.data,
          popupInfo: action.payload,
        },
        error: null,
      };
    // 도, 광역시 클릭 이벤트
    case SIDO_CLICK:
      return {
        data: {
          ...state.data,
          level: 2,
          geojsonData: action.payload.geojson,
          sidoName: action.payload.sidoName,
        },
        error: null,
      };
    // 시,군,구 클릭 이벤트
    case SGG_CLICK:
      return {
        data: {
          ...state.data,
          level: 3,
          popupInfo: null,
          cdrCentersInfo: action.payload.cdrCenters,
          sggName: action.payload.sggName,
        },
        error: null,
      };
    // 도, 광역시 기준 초기화
    case RESET_TO_SIDO_DISTRICT:
      return {
        data: {
          ...state.data,
          level: 1,
          sidoName: "",
          sggName: "",
          geojsonData: action.payload,
          cdrCentersInfo: null,
        },
      };
    // 시,군,구 기준 초기화
    case RESET_TO_SGG_DISTRICT:
      return {
        data: {
          ...state.data,
          level: 2,
          sidoName: action.payload.sidoName,
          sggName: "",
          geojsonData: action.payload.geojson,
          cdrCentersInfo: null,
        },
      };

    // 마커 클릭 이벤트
    case MARKER_Click:
      return {
        data: {
          ...state.data,
          popupInfo: action.payload,
        },
      };
    // 에러 발생
    case ERROR:
      return {
        ...state,
        data: null,
        error: action.payload,
      };
    default:
      return state;
  }
}
