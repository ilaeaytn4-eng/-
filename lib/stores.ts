export const stores = {
  gongdo: {name:"공도점", address:"경기도 안성시 공도로 109", phone:"", note:"공도소방서 옆, 매장 앞 주차 가능"},
  jinsa: {name:"진사점", address:"경기도 안성시 서동대로 3874", phone:"", note:"매장 앞 주차 가능"}
} as const;
export type StoreKey = keyof typeof stores;
export const kinds = ["정보형","비교형","홍보형"] as const;
