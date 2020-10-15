import { callsLike } from 'chai-callslike';
import { restore } from 'sinon';
import { use } from 'chai';
import sinonChai = require('sinon-chai');

use(callsLike);
use(sinonChai);

afterEach(() => {
  restore();
});
