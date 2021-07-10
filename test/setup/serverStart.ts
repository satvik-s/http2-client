import { getServer, initServer } from './server';

export default function setup(): void {
    initServer();
    getServer().listen(3001);
}
