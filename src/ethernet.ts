export interface EthernetTCI {
  pcp: number;  // priority code point
  dei: number;  // drop eligible indicator
  vid: number;  // VLAN identifier
}

export interface EthernetTag {
  tpid: number;     // tag protocol identifier
  tci: EthernetTCI; // tag control information
}

export interface EthernetHeader {
  destination: string; // 48-bit MAC address as hex string
  source: string;      // 48-bit MAC address as hex string
  tag?: EthernetTag;   // TPID_8021Q tag
  stag?: EthernetTag;  // TPID_8021ad or TPID_QinQ service (outer) tag
  ctag?: EthernetTag;  // TPID_8021ad or TPID_QinQ customer (inner) tag
  ethertype: number;
  payload: string;     // remaining data as hex string
}

// Reference: https://en.wikipedia.org/wiki/IEEE_802.1Q
const TPID_8021Q  = 0x8100;
const TPID_8021ad = 0x88a8;
const TPID_QinQ   = 0x9100;

const decodeTCI = (tci: number): EthernetTCI => {
  return {
    pcp: (tci >> 13) & 0x7, // bits 14-16
    dei: (tci >> 11) & 0x1, // bit 13
    vid: tci & 0xfff,       // low 12 bits
  };
};

const decodeTag = (data: string): EthernetTag => {
  return {
    tpid: parseInt(data.substr(0, 4), 16),
    tci: decodeTCI(parseInt(data.substr(4, 4), 16)),
  };
};

const decode = (data: string): EthernetHeader => {
  if (data.length < 14 * 2) {
    throw new Error("Frame header must be at least 14 bytes");
  }

  let result: EthernetHeader = {
    destination: data.substr(0, 12),
    source: data.substr(12, 12),
    ethertype: parseInt(data.substr(24, 4), 16),
    payload: data.substring(28),
  };

  if (result.ethertype === TPID_8021Q) {
    if (data.length < 18 * 2) {
      throw new Error("Frame header with tag must be at least 18 bytes");
    }
    result.tag = decodeTag(data.substr(24, 8));
    result.ethertype = parseInt(data.substr(32, 4), 16);
    result.payload = data.substring(36);
  } else if (result.ethertype === TPID_8021ad || result.ethertype === TPID_QinQ) {
    if (data.length < 22 * 2) {
      throw new Error("Frame header with double tag must be at least 22 bytes");
    }
    result.stag = decodeTag(data.substr(24, 8));
    result.ctag = decodeTag(data.substr(32, 8));
    result.ethertype = parseInt(data.substr(40, 4), 16);
    result.payload = data.substring(44);
  }

  return result;
};

/**
 * Decode an Ethernet frame
 * @param {string | Buffer} frame The raw frame data as a hex string or Node.js Buffer
 * @returns {EthernetHeader}
 */
const ethernet = (frame: string | Buffer): EthernetHeader => {
  if (typeof frame === "string") {
    if (!/^([A-Fa-f0-9]{2})+$/.test(frame)) {
      throw new TypeError("Frame must be hex string or Buffer");
    }
    return decode(frame);
  } else if (typeof Buffer !== undefined && Buffer.isBuffer(frame)) {
    return decode(frame.toString("hex"));
  } else {
    throw new TypeError("Frame must be hex string or Buffer");
  }
};

export default ethernet;
