class MatrixProcessor {
  constructor(config) {
    this.config = config;
  }

  process(rawMatrix) {
    var transformedMatrix = [];

    for(var key in rawMatrix) {
      var processedDot = this.processDot(key, rawMatrix[key].hex)
      transformedMatrix.push(processedDot);
    }

    return transformedMatrix;
  }

  processDot(key, hex) {
    var rawCoordinates = key.split(':'),
        shadedHex = shadeHex(hex, -((100 - this.config.brightness) / 100));

    return {
      y: parseInt(rawCoordinates[0], 10),
      x: parseInt(rawCoordinates[1], 10),
      hex: shadedHex
    };
  }
}

function shadeHex(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

export { MatrixProcessor as default }
