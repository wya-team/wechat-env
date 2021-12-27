import { initUse } from './use';
import { initMixin } from './mixin';
import { initProxy } from './proxy';
import { initPreprocessingTask } from './preprocessing-task';
import Provider from '../class/provider';
import MolApp from '../class/mol-app';
import MolPage from '../class/mol-page';
import MolComponent from '../class/mol-component';

export function initGlobalApi(Mol) {
	Mol.MolApp = MolApp;
	Mol.MolPage = MolPage;
	Mol.MolComponent = MolComponent;
	
	initMixin(Mol);
	initProxy(Mol);
	initUse(Mol);
	initPreprocessingTask(Mol);

	Mol.provider = new Provider();

	return Mol;
}