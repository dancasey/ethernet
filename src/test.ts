import test from "ava";
import decode from "./ethernet";

const plainFrame = "\
0102030405060a0b0c0d0e0f08004500\
00541ecd0000400141e30a00010b4a7d\
c4710800139a2a34000057e4247f0007\
52c408090a0b0c0d0e0f101112131415\
161718191a1b1c1d1e1f202122232425\
262728292a2b2c2d2e2f303132333435\
3637";
const shortFrame = "01020304";
const badFrame = "0102030405060708091011121314150g17";
const tagFrame = "\
0102030405060a0b0c0d0e0f8100001008004500\
00541ecd0000400141e30a00010b4a7d\
c4710800139a2a34000057e4247f0007\
52c408090a0b0c0d0e0f101112131415\
161718191a1b1c1d1e1f202122232425\
262728292a2b2c2d2e2f303132333435\
3637";
const doubleTagFrame = "\
0102030405060a0b0c0d0e0f88a800108100002008004500\
00541ecd0000400141e30a00010b4a7d\
c4710800139a2a34000057e4247f0007\
52c408090a0b0c0d0e0f101112131415\
161718191a1b1c1d1e1f202122232425\
262728292a2b2c2d2e2f303132333435\
3637";

test("decodes from string", t => {
  let f = decode(plainFrame);
  t.is(typeof f, "object");
  t.is(f.destination, "010203040506");
  t.is(f.source, "0a0b0c0d0e0f");
  t.is(f.ethertype, 0x800);
});

test("decodes from buffer", t => {
  let f = decode(Buffer.from(plainFrame, "hex"));
  t.is(typeof f, "object");
  t.is(f.destination, "010203040506");
  t.is(f.source, "0a0b0c0d0e0f");
  t.is(f.ethertype, 0x800);
});

test("decodes 802.1Q tag", t => {
  let f = decode(tagFrame);
  t.is(typeof f, "object");
  t.is(f.destination, "010203040506");
  t.is(f.source, "0a0b0c0d0e0f");
  t.is(f.ethertype, 0x800);
  t.deepEqual(f.tag, {
    tpid: 0x8100,
    tci: {
      pcp: 0,
      dei: 0,
      vid: 16,
    },
  });
});

test("decodes 802.1ad tag", t => {
  let f = decode(doubleTagFrame);
  t.is(typeof f, "object");
  t.is(f.destination, "010203040506");
  t.is(f.source, "0a0b0c0d0e0f");
  t.is(f.ethertype, 0x800);
  t.deepEqual(f.stag, {
    tpid: 0x88a8,
    tci: {
      pcp: 0,
      dei: 0,
      vid: 16,
    },
  });
  t.deepEqual(f.ctag, {
    tpid: 0x8100,
    tci: {
      pcp: 0,
      dei: 0,
      vid: 32,
    },
  });
});

test("throws on short string", t => {
  t.throws(() => decode(shortFrame));
});

test("throws on short buffer", t => {
  t.throws(() => decode(Buffer.from(shortFrame, "hex")));
});

test("throws on bad string", t => {
  t.throws(() => decode(badFrame));
});
