import { SERVER_URL } from '../data/constants';
import { CarObject } from '../interfaces/interfaces';

const garage = `${SERVER_URL}/garage`;

const winners = `${SERVER_URL}/winners`;

const engine = `${SERVER_URL}/engine`;

export const getCars = async (): Promise<CarObject[]> => {
  const response = await (await fetch(garage)).json();
  return response;
};
export const getWinners = async (): Promise<CarObject[]> => {
  const response = await (await fetch(winners)).json();
  return response;
};
export const engineRequest = async (): Promise<CarObject[]> => {
  const response = await (await fetch(engine)).json();
  return response;
};
