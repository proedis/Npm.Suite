import { contextBuilder } from '@proedis/react';


/* --------
* Context Types
* -------- */
export interface ModalContextValue {
  closeModal: () => void;
}


/* --------
* Context Building
* -------- */
export const {
  useModalContext,
  ModalContextProvider
} = contextBuilder<ModalContextValue, 'ModalContext'>('ModalContext');