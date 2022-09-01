import { Git } from 'node-git-server';
import * as path from 'path';

const tmpDir = path.join(__dirname, '../../tmp');
const reposDir = path.join(tmpDir, 'repos');
const repos = new Git(reposDir);

repos.listen(
    7000,
    {
        type: 'http',
    },
    () => {},
);
