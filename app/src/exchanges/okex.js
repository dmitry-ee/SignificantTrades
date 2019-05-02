const Exchange = require('../exchange');
const WebSocket = require('ws');
const pako = require('pako')

class Okex extends Exchange {

	constructor(options) {
		super(options);

    this.id = 'okex';

    this.type = 'spots';

    this.mapping = pair => {
      if (this.pairs[pair]) {
        this.type = /(1WEEK|2WEEKS|QUARTER)$/.test(pair) ? 'futures' : 'spots';

        return this.pairs[pair].toLowerCase();
      }

      return false;
    }

    this.pairs = {
      LTCBTC: 'ltc_btc',
      ETHBTC: 'eth_btc',
      ETCBTC: 'etc_btc',
      BCHBTC: 'bch_btc',
      '1STBTC': '1st_btc',
      AACBTC: 'aac_btc',
      ABTBTC: 'abt_btc',
      ACEBTC: 'ace_btc',
      ACTBTC: 'act_btc',
      AIDOCBTC: 'aidoc_btc',
      AMMBTC: 'amm_btc',
      ARKBTC: 'ark_btc',
      ASTBTC: 'ast_btc',
      ATLBTC: 'atl_btc',
      AUTOBTC: 'auto_btc',
      AVTBTC: 'avt_btc',
      BCDBTC: 'bcd_btc',
      BCXBTC: 'bcx_btc',
      BECBTC: 'bec_btc',
      BKXBTC: 'bkx_btc',
      BNTBTC: 'bnt_btc',
      BRDBTC: 'brd_btc',
      BT2BTC: 'bt2_btc',
      BTGBTC: 'btg_btc',
      BTMBTC: 'btm_btc',
      CAGBTC: 'cag_btc',
      CANBTC: 'can_btc',
      CBTBTC: 'cbt_btc',
      CHATBTC: 'chat_btc',
      CICBTC: 'cic_btc',
      CMTBTC: 'cmt_btc',
      CTRBTC: 'ctr_btc',
      CVCBTC: 'cvc_btc',
      DADIBTC: 'dadi_btc',
      DASHBTC: 'dash_btc',
      DATBTC: 'dat_btc',
      DENTBTC: 'dent_btc',
      DGBBTC: 'dgb_btc',
      DGDBTC: 'dgd_btc',
      DNABTC: 'dna_btc',
      DNTBTC: 'dnt_btc',
      DPYBTC: 'dpy_btc',
      EDOBTC: 'edo_btc',
      ELFBTC: 'elf_btc',
      ENGBTC: 'eng_btc',
      ENJBTC: 'enj_btc',
      EOSBTC: 'eos_btc',
      EVXBTC: 'evx_btc',
      FAIRBTC: 'fair_btc',
      FUNBTC: 'fun_btc',
      GASBTC: 'gas_btc',
      GNTBTC: 'gnt_btc',
      GNXBTC: 'gnx_btc',
      GSCBTC: 'gsc_btc',
      GTCBTC: 'gtc_btc',
      GTOBTC: 'gto_btc',
      HMCBTC: 'hmc_btc',
      HOTBTC: 'hot_btc',
      HSRBTC: 'hsr_btc',
      ICNBTC: 'icn_btc',
      ICXBTC: 'icx_btc',
      INSBTC: 'ins_btc',
      INSURBTC: 'insur_btc',
      INTBTC: 'int_btc',
      IOSTBTC: 'iost_btc',
      IOTABTC: 'iota_btc',
      IPCBTC: 'ipc_btc',
      ITCBTC: 'itc_btc',
      KCASHBTC: 'kcash_btc',
      KEYBTC: 'key_btc',
      KNCBTC: 'knc_btc',
      LABTC: 'la_btc',
      LENDBTC: 'lend_btc',
      LEVBTC: 'lev_btc',
      LIGHTBTC: 'light_btc',
      LINKBTC: 'link_btc',
      LRCBTC: 'lrc_btc',
      MAGBTC: 'mag_btc',
      MANABTC: 'mana_btc',
      MCOBTC: 'mco_btc',
      MDABTC: 'mda_btc',
      MDTBTC: 'mdt_btc',
      MITHBTC: 'mith_btc',
      MKRBTC: 'mkr_btc',
      MOFBTC: 'mof_btc',
      MOTBTC: 'mot_btc',
      MTHBTC: 'mth_btc',
      MTLBTC: 'mtl_btc',
      NANOBTC: 'nano_btc',
      NASBTC: 'nas_btc',
      NEOBTC: 'neo_btc',
      NGCBTC: 'ngc_btc',
      NULSBTC: 'nuls_btc',
      OAXBTC: 'oax_btc',
      OFBTC: 'of_btc',
      OKBBTC: 'okb_btc',
      OMGBTC: 'omg_btc',
      ONTBTC: 'ont_btc',
      OSTBTC: 'ost_btc',
      PAYBTC: 'pay_btc',
      POEBTC: 'poe_btc',
      PPTBTC: 'ppt_btc',
      PRABTC: 'pra_btc',
      PSTBTC: 'pst_btc',
      QTUMBTC: 'qtum_btc',
      QUNBTC: 'qun_btc',
      QVTBTC: 'qvt_btc',
      RBTC: 'r_btc',
      RCNBTC: 'rcn_btc',
      RCTBTC: 'rct_btc',
      RDNBTC: 'rdn_btc',
      READBTC: 'read_btc',
      REFBTC: 'ref_btc',
      RENBTC: 'ren_btc',
      REQBTC: 'req_btc',
      RFRBTC: 'rfr_btc',
      RNTBTC: 'rnt_btc',
      SALTBTC: 'salt_btc',
      SANBTC: 'san_btc',
      SBTCBTC: 'sbtc_btc',
      SHOWBTC: 'show_btc',
      SMTBTC: 'smt_btc',
      SNCBTC: 'snc_btc',
      SNGLSBTC: 'sngls_btc',
      SNMBTC: 'snm_btc',
      SNTBTC: 'snt_btc',
      SOCBTC: 'soc_btc',
      SPFBTC: 'spf_btc',
      SSCBTC: 'ssc_btc',
      STCBTC: 'stc_btc',
      STORJBTC: 'storj_btc',
      SUBBTC: 'sub_btc',
      SWFTCBTC: 'swftc_btc',
      TCTBTC: 'tct_btc',
      THETABTC: 'theta_btc',
      TIOBTC: 'tio_btc',
      TNBBTC: 'tnb_btc',
      TOPCBTC: 'topc_btc',
      TRABTC: 'tra_btc',
      TRIOBTC: 'trio_btc',
      TRUEBTC: 'true_btc',
      TRXBTC: 'trx_btc',
      UBTCBTC: 'ubtc_btc',
      UCTBTC: 'uct_btc',
      UGCBTC: 'ugc_btc',
      UKGBTC: 'ukg_btc',
      UTKBTC: 'utk_btc',
      VEEBTC: 'vee_btc',
      VIBBTC: 'vib_btc',
      VIUBTC: 'viu_btc',
      WBTCBTC: 'wbtc_btc',
      WFEEBTC: 'wfee_btc',
      WRCBTC: 'wrc_btc',
      WTCBTC: 'wtc_btc',
      XEMBTC: 'xem_btc',
      XLMBTC: 'xlm_btc',
      XMRBTC: 'xmr_btc',
      XRPBTC: 'xrp_btc',
      XUCBTC: 'xuc_btc',
      YEEBTC: 'yee_btc',
      YOYOBTC: 'yoyo_btc',
      ZECBTC: 'zec_btc',
      ZENBTC: 'zen_btc',
      ZIPBTC: 'zip_btc',
      ZRXBTC: 'zrx_btc',
      BTCUSD: 'btc_usdt',
      LTCUSD: 'ltc_usdt',
      ETHUSD: 'eth_usdt',
      ETCUSD: 'etc_usdt',
      BCHUSD: 'bch_usdt',
      '1STUSD': '1st_usdt',
      AACUSD: 'aac_usdt',
      ABTUSD: 'abt_usdt',
      ACEUSD: 'ace_usdt',
      ACTUSD: 'act_usdt',
      AIDOCUSD: 'aidoc_usdt',
      AMMUSD: 'amm_usdt',
      ARKUSD: 'ark_usdt',
      ASTUSD: 'ast_usdt',
      ATLUSD: 'atl_usdt',
      AUTOUSD: 'auto_usdt',
      AVTUSD: 'avt_usdt',
      BCDUSD: 'bcd_usdt',
      BECUSD: 'bec_usdt',
      BKXUSD: 'bkx_usdt',
      BNTUSD: 'bnt_usdt',
      BRDUSD: 'brd_usdt',
      BTGUSD: 'btg_usdt',
      BTMUSD: 'btm_usdt',
      CAGUSD: 'cag_usdt',
      CANUSD: 'can_usdt',
      CBTUSD: 'cbt_usdt',
      CHATUSD: 'chat_usdt',
      CICUSD: 'cic_usdt',
      CMTUSD: 'cmt_usdt',
      CTRUSD: 'ctr_usdt',
      CVCUSD: 'cvc_usdt',
      DADIUSD: 'dadi_usdt',
      DASHUSD: 'dash_usdt',
      DATUSD: 'dat_usdt',
      DENTUSD: 'dent_usdt',
      DGBUSD: 'dgb_usdt',
      DGDUSD: 'dgd_usdt',
      DNAUSD: 'dna_usdt',
      DNTUSD: 'dnt_usdt',
      DPYUSD: 'dpy_usdt',
      EDOUSD: 'edo_usdt',
      ELFUSD: 'elf_usdt',
      ENGUSD: 'eng_usdt',
      ENJUSD: 'enj_usdt',
      EOSUSD: 'eos_usdt',
      EVXUSD: 'evx_usdt',
      FAIRUSD: 'fair_usdt',
      FUNUSD: 'fun_usdt',
      GASUSD: 'gas_usdt',
      GNTUSD: 'gnt_usdt',
      GNXUSD: 'gnx_usdt',
      GSCUSD: 'gsc_usdt',
      GTCUSD: 'gtc_usdt',
      GTOUSD: 'gto_usdt',
      HMCUSD: 'hmc_usdt',
      HOTUSD: 'hot_usdt',
      HSRUSD: 'hsr_usdt',
      ICNUSD: 'icn_usdt',
      ICXUSD: 'icx_usdt',
      INSUSD: 'ins_usdt',
      INSURUSD: 'insur_usdt',
      INTUSD: 'int_usdt',
      IOSTUSD: 'iost_usdt',
      IOTAUSD: 'iota_usdt',
      IPCUSD: 'ipc_usdt',
      ITCUSD: 'itc_usdt',
      KCASHUSD: 'kcash_usdt',
      KEYUSD: 'key_usdt',
      KNCUSD: 'knc_usdt',
      LAUSD: 'la_usdt',
      LENDUSD: 'lend_usdt',
      LEVUSD: 'lev_usdt',
      LIGHTUSD: 'light_usdt',
      LINKUSD: 'link_usdt',
      LRCUSD: 'lrc_usdt',
      MAGUSD: 'mag_usdt',
      MANAUSD: 'mana_usdt',
      MCOUSD: 'mco_usdt',
      MDAUSD: 'mda_usdt',
      MDTUSD: 'mdt_usdt',
      MITHUSD: 'mith_usdt',
      MKRUSD: 'mkr_usdt',
      MOFUSD: 'mof_usdt',
      MOTUSD: 'mot_usdt',
      MTHUSD: 'mth_usdt',
      MTLUSD: 'mtl_usdt',
      NANOUSD: 'nano_usdt',
      NASUSD: 'nas_usdt',
      NEOUSD: 'neo_usdt',
      NGCUSD: 'ngc_usdt',
      NULSUSD: 'nuls_usdt',
      OAXUSD: 'oax_usdt',
      OFUSD: 'of_usdt',
      OKBUSD: 'okb_usdt',
      OMGUSD: 'omg_usdt',
      ONTUSD: 'ont_usdt',
      OSTUSD: 'ost_usdt',
      PAYUSD: 'pay_usdt',
      POEUSD: 'poe_usdt',
      PPTUSD: 'ppt_usdt',
      PRAUSD: 'pra_usdt',
      PSTUSD: 'pst_usdt',
      QTUMUSD: 'qtum_usdt',
      QUNUSD: 'qun_usdt',
      QVTUSD: 'qvt_usdt',
      RUSD: 'r_usdt',
      RCNUSD: 'rcn_usdt',
      RCTUSD: 'rct_usdt',
      RDNUSD: 'rdn_usdt',
      READUSD: 'read_usdt',
      REFUSD: 'ref_usdt',
      RENUSD: 'ren_usdt',
      REQUSD: 'req_usdt',
      RFRUSD: 'rfr_usdt',
      RNTUSD: 'rnt_usdt',
      SALTUSD: 'salt_usdt',
      SANUSD: 'san_usdt',
      SHOWUSD: 'show_usdt',
      SMTUSD: 'smt_usdt',
      SNCUSD: 'snc_usdt',
      SNGLSUSD: 'sngls_usdt',
      SNMUSD: 'snm_usdt',
      SNTUSD: 'snt_usdt',
      SOCUSD: 'soc_usdt',
      SPFUSD: 'spf_usdt',
      SSCUSD: 'ssc_usdt',
      STCUSD: 'stc_usdt',
      STORJUSD: 'storj_usdt',
      SUBUSD: 'sub_usdt',
      SWFTCUSD: 'swftc_usdt',
      TCTUSD: 'tct_usdt',
      THETAUSD: 'theta_usdt',
      TIOUSD: 'tio_usdt',
      TNBUSD: 'tnb_usdt',
      TOPCUSD: 'topc_usdt',
      TRAUSD: 'tra_usdt',
      TRIOUSD: 'trio_usdt',
      TRUEUSD: 'true_usdt',
      TRXUSD: 'trx_usdt',
      UBTCUSD: 'ubtc_usdt',
      UCTUSD: 'uct_usdt',
      UGCUSD: 'ugc_usdt',
      UKGUSD: 'ukg_usdt',
      UTKUSD: 'utk_usdt',
      VEEUSD: 'vee_usdt',
      VIBUSD: 'vib_usdt',
      VIUUSD: 'viu_usdt',
      WFEEUSD: 'wfee_usdt',
      WRCUSD: 'wrc_usdt',
      WTCUSD: 'wtc_usdt',
      XEMUSD: 'xem_usdt',
      XLMUSD: 'xlm_usdt',
      XMRUSD: 'xmr_usdt',
      XRPUSD: 'xrp_usdt',
      XUCUSD: 'xuc_usdt',
      YEEUSD: 'yee_usdt',
      YOYOUSD: 'yoyo_usdt',
      ZECUSD: 'zec_usdt',
      ZENUSD: 'zen_usdt',
      ZIPUSD: 'zip_usdt',
      ZRXUSD: 'zrx_usdt',
      LTCETH: 'ltc_eth',
      ETCETH: 'etc_eth',
      BCHETH: 'bch_eth',
      '1STETH': '1st_eth',
      AACETH: 'aac_eth',
      ABTETH: 'abt_eth',
      ACEETH: 'ace_eth',
      ACTETH: 'act_eth',
      AIDOCETH: 'aidoc_eth',
      AMMETH: 'amm_eth',
      ARKETH: 'ark_eth',
      ASTETH: 'ast_eth',
      ATLETH: 'atl_eth',
      AUTOETH: 'auto_eth',
      AVTETH: 'avt_eth',
      BECETH: 'bec_eth',
      BKXETH: 'bkx_eth',
      BNTETH: 'bnt_eth',
      BRDETH: 'brd_eth',
      BTMETH: 'btm_eth',
      CAGETH: 'cag_eth',
      CANETH: 'can_eth',
      CBTETH: 'cbt_eth',
      CHATETH: 'chat_eth',
      CICETH: 'cic_eth',
      CMTETH: 'cmt_eth',
      CTRETH: 'ctr_eth',
      CVCETH: 'cvc_eth',
      DADIETH: 'dadi_eth',
      DASHETH: 'dash_eth',
      DATETH: 'dat_eth',
      DENTETH: 'dent_eth',
      DGBETH: 'dgb_eth',
      DGDETH: 'dgd_eth',
      DNAETH: 'dna_eth',
      DNTETH: 'dnt_eth',
      DPYETH: 'dpy_eth',
      EDOETH: 'edo_eth',
      ELFETH: 'elf_eth',
      ENGETH: 'eng_eth',
      ENJETH: 'enj_eth',
      EOSETH: 'eos_eth',
      EVXETH: 'evx_eth',
      FAIRETH: 'fair_eth',
      FUNETH: 'fun_eth',
      GASETH: 'gas_eth',
      GNTETH: 'gnt_eth',
      GNXETH: 'gnx_eth',
      GSCETH: 'gsc_eth',
      GTCETH: 'gtc_eth',
      GTOETH: 'gto_eth',
      HMCETH: 'hmc_eth',
      HOTETH: 'hot_eth',
      HSRETH: 'hsr_eth',
      ICNETH: 'icn_eth',
      ICXETH: 'icx_eth',
      INSETH: 'ins_eth',
      INSURETH: 'insur_eth',
      INTETH: 'int_eth',
      IOSTETH: 'iost_eth',
      IOTAETH: 'iota_eth',
      IPCETH: 'ipc_eth',
      ITCETH: 'itc_eth',
      KCASHETH: 'kcash_eth',
      KEYETH: 'key_eth',
      KNCETH: 'knc_eth',
      LAETH: 'la_eth',
      LENDETH: 'lend_eth',
      LEVETH: 'lev_eth',
      LIGHTETH: 'light_eth',
      LINKETH: 'link_eth',
      LRCETH: 'lrc_eth',
      MAGETH: 'mag_eth',
      MANAETH: 'mana_eth',
      MCOETH: 'mco_eth',
      MDAETH: 'mda_eth',
      MDTETH: 'mdt_eth',
      MITHETH: 'mith_eth',
      MKRETH: 'mkr_eth',
      MOFETH: 'mof_eth',
      MOTETH: 'mot_eth',
      MTHETH: 'mth_eth',
      MTLETH: 'mtl_eth',
      NANOETH: 'nano_eth',
      NASETH: 'nas_eth',
      NEOETH: 'neo_eth',
      NGCETH: 'ngc_eth',
      NULSETH: 'nuls_eth',
      OAXETH: 'oax_eth',
      OFETH: 'of_eth',
      OKBETH: 'okb_eth',
      OMGETH: 'omg_eth',
      ONTETH: 'ont_eth',
      OSTETH: 'ost_eth',
      PAYETH: 'pay_eth',
      POEETH: 'poe_eth',
      PPTETH: 'ppt_eth',
      PRAETH: 'pra_eth',
      PSTETH: 'pst_eth',
      QTUMETH: 'qtum_eth',
      QUNETH: 'qun_eth',
      QVTETH: 'qvt_eth',
      RETH: 'r_eth',
      RCNETH: 'rcn_eth',
      RCTETH: 'rct_eth',
      RDNETH: 'rdn_eth',
      READETH: 'read_eth',
      REFETH: 'ref_eth',
      RENETH: 'ren_eth',
      REQETH: 'req_eth',
      RFRETH: 'rfr_eth',
      RNTETH: 'rnt_eth',
      SALTETH: 'salt_eth',
      SANETH: 'san_eth',
      SHOWETH: 'show_eth',
      SMTETH: 'smt_eth',
      SNCETH: 'snc_eth',
      SNGLSETH: 'sngls_eth',
      SNMETH: 'snm_eth',
      SNTETH: 'snt_eth',
      SOCETH: 'soc_eth',
      SPFETH: 'spf_eth',
      SSCETH: 'ssc_eth',
      STCETH: 'stc_eth',
      STORJETH: 'storj_eth',
      SUBETH: 'sub_eth',
      SWFTCETH: 'swftc_eth',
      TCTETH: 'tct_eth',
      THETAETH: 'theta_eth',
      TIOETH: 'tio_eth',
      TNBETH: 'tnb_eth',
      TOPCETH: 'topc_eth',
      TRAETH: 'tra_eth',
      TRIOETH: 'trio_eth',
      TRUEETH: 'true_eth',
      TRXETH: 'trx_eth',
      UBTCETH: 'ubtc_eth',
      UCTETH: 'uct_eth',
      UGCETH: 'ugc_eth',
      UKGETH: 'ukg_eth',
      UTKETH: 'utk_eth',
      VEEETH: 'vee_eth',
      VIBETH: 'vib_eth',
      VIUETH: 'viu_eth',
      WFEEETH: 'wfee_eth',
      WRCETH: 'wrc_eth',
      WTCETH: 'wtc_eth',
      XEMETH: 'xem_eth',
      XLMETH: 'xlm_eth',
      XMRETH: 'xmr_eth',
      XRPETH: 'xrp_eth',
      XUCETH: 'xuc_eth',
      YEEETH: 'yee_eth',
      YOYOETH: 'yoyo_eth',
      ZECETH: 'zec_eth',
      ZENETH: 'zen_eth',
      ZIPETH: 'zip_eth',
      ZRXETH: 'zrx_eth'
    };

    ['BTC', 'LTC', 'ETH', 'ETC', 'BCH', 'XRP', 'EOS', 'BTG'].forEach(coin => {
      this.pairs[coin + '1WEEK'] = coin + '_trade_this_week';
      this.pairs[coin + '2WEEKS'] = coin + '_trade_next_week';
      this.pairs[coin + 'QUARTER'] = coin + '_trade_quarter';
    });

		this.options = Object.assign({
      url: (pair) => {
        return this.type === 'futures' ? 'wss://real.okex.com:10440/websocket/okexapi' : 'wss://real.okex.com:10441/websocket'
      }
		}, this.options);
	}

	connect(pair) {
    if (!super.connect(pair))
      return;

    this.api = new WebSocket(this.getUrl());
    this.api.binaryType = 'ArrayBuffer';

    this.api.on('message', event => this.emitData(this.format(event)));

    this.api.on('open', event => {
      const channel = this.type === 'futures' ? 'ok_sub_futureusd_' + this.pair : 'ok_sub_spot_' + this.pair + '_deals';

      this.api.send(JSON.stringify({event: 'addChannel', channel: channel}));

      this.keepalive = setInterval(() => {
        this.api.readyState === 1 && this.api.send(JSON.stringify({event: 'ping'}));
      }, 30000);

      this.emitOpen(event);
    });

    this.api.on('close', event => {
      this.emitClose(event);

      clearInterval(this.keepalive);
    });

    this.api.on('error', this.emitError.bind(this));
	}

	disconnect() {
    if (!super.disconnect())
      return;

    clearInterval(this.keepalive);

    if (this.api && this.api.readyState < 2) {
      this.api.close();

      delete this.reference;
    }
	}

	format(event) {
    let json;
    
    try {
      if (event instanceof String) {
        json = JSON.parse(event);
      } else {
        json = JSON.parse(pako.inflateRaw(event, {to: 'string'}));
      }
    } catch (error) {
      console.error(`[okex] failed to parse event data`, error);
      return;
    }

    const initial = typeof this.reference === 'undefined';

    if (!json || !json[0] || json[0].channel === 'addChannel') {
      return;
    }

    const base = new Date();
    base.setTime(base.getTime() + ((8 + base.getTimezoneOffset() / 60)*60*60*1000));

    const output = json[0].data.map((trade, index, array) => {
      const timestamp = +new Date(`${base.getFullYear()}-${base.getMonth() + 1}-${base.getDate()} ${trade[3]}+08:00`);

      if (index === array.length - 1) {
        this.reference = timestamp;
      }

      return [
        timestamp,
        +trade[1],
        this.type === 'futures' ? trade[2] / trade[1] * 100 : +trade[2],
        trade[4] === 'bid' ? 1 : 0
      ];
    })

    if (!initial) {
      return output;
    }
	}

  pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
  }

}

module.exports = Okex;