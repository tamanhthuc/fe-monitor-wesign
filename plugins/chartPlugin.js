import Chart from 'chart.js';
import moment from 'moment';

const ChartPlugin = {
    install(app) {
      // Đăng ký Chart.js và Moment.js global cho ứng dụng Vue.js
      app.config.globalProperties.$Chart = Chart;
      app.config.globalProperties.$moment = moment;
    },
  };
  
  export default ChartPlugin;