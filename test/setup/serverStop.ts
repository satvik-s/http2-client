import { getServer } from './server';

export default function setup(): void {
    getServer().close();
}
