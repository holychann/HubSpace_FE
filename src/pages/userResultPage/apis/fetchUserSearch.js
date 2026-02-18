// import {apiGetPublic} from '../../../utils/ApiUtil'

import { getUserSearchResult } from '../utils/UserResultDummy'

export const fetchUserSearch = async (eventId, userSearchData, eventDetail) => {
  // const searchQuery = new URLSearchParams(userSearchData)
  // const res = await apiGetPublic(`/v1/events/${eventId}/search${searchQuery.toString()}`)
  // return res.data

  // 더미 데이터
  return getUserSearchResult(userSearchData, eventDetail)
}
