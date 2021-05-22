import { combineReducers } from "redux";
import mapboxEventReducer from "./mapboxEvent";
import mapboxReducer from "./mapbox";

// 여러 개의 리듀서를 통합
const rootReducers = combineReducers({ mapboxReducer, mapboxEventReducer });

export default rootReducers;
