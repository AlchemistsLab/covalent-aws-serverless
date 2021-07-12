import axios from 'axios';

// function for remove decimals end with 000...
export const numberOptimizeDecimal = number => {
	if (typeof number === 'number') {
		number = number.toString();
	}
	if (number === 'NaN') {
		return '<0.00000001';
	}
	if (typeof number === 'string') {
		if (number.indexOf('.') > -1) {
			let decimal = number.substring(number.indexOf('.') + 1);
			while (decimal.endsWith('0')) {
				decimal = decimal.substring(0, decimal.length - 1);
			}
			if (number.substring(0, number.indexOf('.')).length >= 7 && decimal.length > 2 && !isNaN(`0.${decimal}`)) {
				decimal = Number(`0.${decimal}`).toFixed(2).toString();
				if (decimal.indexOf('.') > -1) {
					decimal = decimal.substring(decimal.indexOf('.') + 1);
					while (decimal.endsWith('0')) {
						decimal = decimal.substring(0, decimal.length - 1);
					}
				}
			}
			return `${number.substring(0, number.indexOf('.'))}${decimal ? '.' : ''}${decimal}`;
		}
		return number;
	}
	return '';
};

// function for generate extra attrbutes for each chain
export const getChainExtraFields = chainName => {
	switch (chainName) {
    case 'eth-mainnet':
		case 'eth-kovan':
		  return { unit: 'Ether' };
    case 'matic-mainnet':
		case 'matic-mumbai':
		  return { unit: 'MATIC' };
    case 'avalanche-mainnet':
		case 'avalanche-testnet':
		  return { unit: 'AVAX', gas_unit: 'nAVAX' };
    case 'bsc-mainnet':
		case 'bsc-testnet':
		  return { unit: 'BNB' };
    case 'moonbeam-moonbase-alpha':
		  return { unit: 'DEV' };
    case 'moonbeam-moonriver':
		  return { unit: 'MOVR' };
    case 'rsk-mainnet':
		case 'rsk-testnet':
		  return { unit: 'RBTC' };
    case 'arbitrum-mainnet':
		case 'arbitrum-testnet':
		  return { unit: 'Ether' };
    case 'fantom-mainnet':
		case 'fantom-testnet':
		  return { unit: 'FTM' };
    case 'palm-mainnet':
		case 'palm-testnet':
		  return { unit: 'Ether' };
    case 'covalent-internal-network-v1':
      return { unit: 'CQT' };
    default: return { unit: 'Ether' };
  }
};

// fix nft image data
export const fixNFTImageData = async nftData => {
	const videoKeywords = ['video', 'mp4'];
	const needToRequestData = nftData => !nftData.external_data || !nftData.external_data.image || (nftData.external_data.description && videoKeywords.findIndex(kw => nftData.external_data.description.toLowerCase().indexOf(kw) > -1) > -1);
	if (needToRequestData(nftData) && ((nftData.external_data && nftData.external_data.external_url) || nftData.token_url)) {
		if (nftData.external_data && nftData.external_data.external_url) {
			try {
		    const res = await axios.get(nftData.external_data.external_url)
		      .catch(error => { return { data: null }; });
		    if (res && res.data) {
		      nftData.external_data = {
		      	...nftData.external_data,
		      	...res.data,
		      	image: res.data.image ? typeof res.data.image === 'object' ? res.data.description ? res.data.description : nftData.external_data.image : res.data.image : nftData.external_data.image,
		      };
		    }
		  } catch (error) {}
		}
		if (needToRequestData(nftData) && nftData.token_url) {
			try {
		    const res = await axios.get(nftData.token_url)
		      .catch(error => { return { data: null }; });
		    if (res && res.data) {
		      nftData.external_data = {
		      	...nftData.external_data,
		      	...res.data,
		      	image: res.data.image ? typeof res.data.image === 'object' ? res.data.description ? res.data.description : nftData.external_data.image : res.data.image : nftData.external_data.image,
		      };
		    }
		  } catch (error) {}
		}
	}
	if (nftData.external_data) {
		const siteUrl = 'https://cloudflare-ipfs.com/';
		if (nftData.external_data.image && nftData.external_data.image.startsWith(siteUrl)) {
			const paths = nftData.external_data.image.replace(siteUrl, '').split('/').filter(path => path);
			if (paths[paths.length - 1] && paths[paths.length - 1].startsWith('image.')) {
				nftData.external_data.image = [nftData.external_data.image, `${siteUrl}${paths.filter((path, i) => !(path.startsWith('image.') && i === paths.length - 1)).join('/')}`];
			}
		}
		const sitePatterns = ['ipfs://', 'https://ipfs.daonomic.com/'];
		sitePatterns.forEach(sitePattern => {
			if (nftData.external_data.image) {
				nftData.external_data.image = (Array.isArray(nftData.external_data.image) ? (nftData.external_data.image) : [nftData.external_data.image]).map(image => image.startsWith(sitePattern) ? image.replace(sitePattern, siteUrl) : image);
			}
			if (nftData.external_data.animation_url && nftData.external_data.animation_url.startsWith(sitePattern)) {
				nftData.external_data.animation_url = nftData.external_data.animation_url.replace(sitePattern, siteUrl);
			}
		});
		(Array.isArray(nftData.external_data.image) ? (nftData.external_data.image) : [nftData.external_data.image]).forEach(image => {
			if (image.endsWith('.mp4') && !nftData.external_data.animation_url) {
				nftData.external_data.animation_url = image;
			}
		});
		nftData.external_data.animation_url = nftData.external_data.animation_url ? nftData.external_data.animation_url.startsWith(siteUrl) && !nftData.external_data.animation_url.startsWith(`${siteUrl}ipfs/`) ? nftData.external_data.animation_url.replace(siteUrl, `${siteUrl}ipfs/`) : nftData.external_data.animation_url : undefined;
		nftData.external_data.image = (Array.isArray(nftData.external_data.image) ? (nftData.external_data.image) : [nftData.external_data.image]).map(image => image.startsWith(siteUrl) && !image.startsWith(`${siteUrl}ipfs/`) ? image.replace(siteUrl, `${siteUrl}ipfs/`) : image);
		if (nftData.external_data.animation_url && Array.isArray(nftData.external_data.image)) {
			nftData.external_data.image = nftData.external_data.image[0];
		}
	}
	return nftData;
};