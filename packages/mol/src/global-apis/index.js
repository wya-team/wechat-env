import { use } from './use';
import Provider from '../class/provider';

export function initGlobalApi(Mol) {
	Mol.use = use;

	Mol.provider = new Provider();

	return Mol;
}