// 필드별 placeholder 매핑
export const userFieldPlaceholders = {
  이름: '이름을 입력해주세요.',
  학번: '학번 10자리를 입력해주세요.',
  전화번호: '전화번호 11자리를 입력해주세요.',
  생년월일: '생년월일 6자리를 입력해주세요.',
}

// 사용자 조회 결과 처리
export const processUserResult = (userApiResponse, eventDetail, userSearchData) => {
  const { searchColumns } = eventDetail

  // 조회 실패
  if (!userApiResponse.isSuccess) {
    return {
      userResultType: 'notFound',
      userDisplayName: userSearchData[searchColumns[0]] || '000',
      userResultMessage: userApiResponse.message || '해당 정보로 조회된 기록이 없습니다.',
    }
  }

  // 조회 성공
  const { answers } = userApiResponse.data

  return {
    userResultType: 'detail',
    userSearchColumns: searchColumns,
    userDetailInfo: answers,
  }
}
