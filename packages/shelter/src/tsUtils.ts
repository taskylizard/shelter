// silly little utility types

export type Repetition<Len extends number, TElem, Arr extends TElem[] = []> = Arr extends { length: Len }
  ? Arr
  : Repetition<Len, TElem, [...Arr, TElem]>;

/*
export type FnArgs<F extends Function> = F extends (...a: infer T) => any ? T : never;
export type ReplaceRet<F extends Function, NewRet> = (...a: FnArgs<F>) => NewRet;
*/
