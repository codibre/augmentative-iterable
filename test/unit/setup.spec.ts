import { callsLike } from 'chai-callslike';
import { restore } from 'sinon';
import { use } from 'chai';
import sinonChai from 'sinon-chai';

use(callsLike);
use(sinonChai);

afterEach(() => {
  restore();
});
