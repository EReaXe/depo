import test from 'node:test';
import assert from 'node:assert/strict';
import {monthlySpending,dashboardMarkup,recentMarkup} from '../assets/js/ui/home-card.js';
test('Aylık harcama yalnız seçilen aydaki tüm dolum tutarlarını toplar',()=>{
 const rows=[{date:'2026-11-01',amount:1200,km:10},{date:'2026-11-14',amount:500,km:20},{date:'2026-10-31',amount:900,km:0}];
 assert.equal(monthlySpending(rows,'2026-11').total,1700);assert.equal(monthlySpending(rows,'2026-10').total,900);assert.equal(monthlySpending(rows,'2026-12').rows.length,0);assert.equal(rows[0].amount,1200);
});
test('Kartlar eksik giderleri sıfır gibi sunmaz ve işlem metnini güvenli gösterir',()=>{
 const html=dashboardMarkup([],'2026-11');for(const name of ['MTV','Bakım','Lastik','Muayene','Diğer','Yaklaşan işler','Son işlemler'])assert.ok(html.includes(name));assert.ok(html.includes('<dd>—</dd>'));assert.ok(html.includes('Henüz planlanmış iş yok.'));
 const recent=recentMarkup([{date:'2026-11-14',fuel:'<script>',litres:20,amount:1000,km:10}]);assert.ok(recent.includes('&lt;script&gt;'));assert.ok(!recent.includes('<script>'));
});
