// 필드별 placeholder 매핑
export const userFieldPlaceholders = {
  이름: '이름을 입력해주세요.',
  학번: '학번 10자리를 입력해주세요.',
  전화번호: '전화번호 11자리를 입력해주세요.',
  생년월일: '생년월일 6자리를 입력해주세요.',
}

// 사용자 조회 결과 처리
export const processUserResult = (userApiResponse, userEventConfig, userSearchData) => {
  const { eventType, searchColumns } = userEventConfig

  // 조회 실패
  if (!userApiResponse.isSuccess) {
    return {
      userResultType: 'notFound',
      userDisplayName: userSearchData['이름'] || '000',
      userResultMessage: userApiResponse.message || '해당 정보로 조회된 기록이 없습니다.',
    }
  }

  const { answers } = userApiResponse.data

  // FORM 이벤트
  if (eventType === 'FORM') {
    return {
      userResultType: 'success',
      userEventType: 'FORM',
      userDisplayName: answers['이름'] || Object.values(answers)[0],
    }
  }

  // CSV 이벤트
  if (eventType === 'FILE') {
    return {
      userResultType: 'detail',
      userEventType: 'FILE',
      userSearchColumns: searchColumns,
      userDetailInfo: {
        ...answers,
        제출여부: '제출 완료',
      },
    }
  }
}
