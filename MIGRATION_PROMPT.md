# Prompt สำหรับย้ายเว็บ 2B2T Thailand ไปเครื่องใหม่

คัดลอกข้อความในกรอบด้านล่างไปใช้กับ agent ที่เข้าถึงทั้งเครื่องต้นทางและเครื่องปลายทางได้

```text
ช่วยย้าย workspace และระบบให้บริการเว็บไซต์ 2B2T Thailand จากเครื่องเดิมไปเครื่องใหม่ โดยทำตามขั้นตอนอย่างระมัดระวัง

Repository: https://github.com/Deluxeg4/2b2t-th-website.git
Branch: main
VPS/Nginx: 10.10.0.1; รับ HTTPS และ reverse proxy ผ่าน WireGuard
เครื่องเว็บ: 10.10.0.2; ให้บริการ HTTP เฉพาะที่ 10.10.0.2:80
เครื่องเว็บใช้ WireGuard interface `wg0` เพื่อเชื่อมกับ VPS
workspace ของเครื่องเว็บอยู่ที่ /root/2b2t-th-website
systemd unit ของเครื่องเว็บคือ 2b2t-th-website.service
service เดิมบน VPS ถูกปิดไว้แล้ว ห้ามเปิดกลับบน VPS

ข้อกำหนดสำคัญ:
- ตรวจสอบก่อนเปลี่ยนแปลงทุกครั้ง และห้าม reboot เครื่องไม่ว่ากรณีใด
- ห้าม kill process แบบเหมารวม, ใช้ `kill -9`, หรือหยุด Nginx โดยไม่จำเป็น
- อย่าลบ workspace, backup, Cloudflare KV namespace, หรือข้อมูล/secret
- ห้ามใส่ private key, API token, password, certificate private key หรือ secret ลง Git
- อย่าเปลี่ยน DNS หรือปิดบริการเดิมจนกว่าจะตรวจปลายทางจากภายนอกสำเร็จ
- แยกการหยุด systemd service ออกจากการ reboot เครื่องให้ชัดเจน

ทำงานตามลำดับนี้:

1. ตรวจเครื่องต้นทางแบบอ่านอย่างเดียวก่อน:
   - ยืนยันชื่อ unit, สถานะ, `ExecStart`, `Restart`, `KillMode`, `WorkingDirectory`
   - ตรวจ process tree, พอร์ต 80/443/3000 และ Nginx `proxy_pass`
   - ตรวจว่าเว็บไซต์สาธารณะเข้า Cloudflare Worker หรือ VPS/Nginx จริง
   - ตรวจ `journalctl` และ boot history เพื่อยืนยันว่าไม่มีงาน shutdown/reboot ค้างอยู่
   - ทำรายการ config ที่ต้องย้าย และ backup config ก่อนแก้

2. ตรวจเครื่องปลายทาง:
   - ยืนยัน Debian/version, สถาปัตยกรรม, พื้นที่ดิสก์, Node.js/npm, Nginx และ firewall
   - ใช้ path `/root/2b2t-th-website` ให้ตรงกับ Compose และ unit เว้นแต่เปลี่ยนทุกจุดให้สอดคล้องกัน
   - clone repository จาก branch `main`; ใช้ `npm ci`, `npm run lint`, `npm run build`
   - ไม่คัดลอก `node_modules` หรือ `dist` จากเครื่องเดิม ให้สร้างใหม่บนเครื่องปลายทาง

3. ตั้ง deployment ตาม ingress ที่ยืนยันแล้ว:
   - เป้าหมายปัจจุบันคือ VPS/Nginx `10.10.0.1` -> WireGuard -> เว็บ `10.10.0.2:80`; backend รับ HTTP ผ่าน WireGuard เท่านั้น ส่วน TLS จบที่ VPS
   - Compose ต้อง bind Docker port เฉพาะ `10.10.0.2:80:80`; ห้ามเปิดเว็บ backend สู่ public interface
   - ติดตั้ง `2b2t-th-website.service` บนเครื่องเว็บเท่านั้น โดยให้เริ่มหลัง `wg-quick@wg0.service` และ Docker; enable ให้เริ่มอัตโนมัติหลัง boot
   - VPS/Nginx ควร proxy upstream ไป `http://10.10.0.2:80` โดยคง TLS certificate และ HTTPS เดิมไว้ หาก config ปัจจุบันยังไม่ตรง
   - ตรวจ Cloudflare DNS/Worker routes ด้วย เพราะ Worker route อาจรับ traffic ก่อนถึง VPS; หาก Worker เป็น ingress จริง ให้รักษา `wrangler.jsonc`, cron, `STATUS_KV` binding และข้อมูล KV เดิม ห้ามสร้าง namespace ใหม่หรือเปลี่ยน ID โดยไม่จำเป็น
   - ห้ามแก้ Nginx ฝั่ง VPS จากเครื่องเว็บโดยไม่มีการเข้าถึง/ตรวจ config จริง
   - ตั้งค่า `QUEUE_HEALTH_URL`, `WEBSITE_HEALTH_URL`, `SHOP_HEALTH_URL` ใน Cloudflare Worker settings ถ้ามีค่าเดิม โดยไม่เผยค่าลับใน output
   - ตรวจ `README.md`, `nginx.conf`, `nginx-proxy.conf`, `Dockerfile`, `docker-compose.yml`, `wrangler.jsonc` ก่อนเลือกวิธีติดตั้ง

4. ทดสอบเครื่องปลายทางก่อน cutover:
   - build/lint ผ่าน
   - ตรวจหน้าแรก, `/th/status`, `/en/status`, static assets และ `/api/status`
   - ตรวจ HTTPS certificate, Nginx logs, Worker logs และ status API
   - ตรวจจากเครือข่ายภายนอกและยืนยันว่า status history/metrics ยังทำงาน
   - บันทึกผลตรวจและ rollback plan

5. Cutover:
   - เปลี่ยน DNS/route เฉพาะเมื่อผู้ใช้ยืนยันแผนและปลายทางผ่านการตรวจทั้งหมดแล้ว
   - หลัง cutover ตรวจหน้าเว็บ, API, TLS, DNS และ error logs ซ้ำ
   - เก็บเครื่องเดิมและ backup ไว้จนกว่าผู้ใช้จะยืนยันว่าใช้งานปลายทางได้
   - เมื่อยืนยันแล้ว ให้คง service บนเครื่องเว็บ `10.10.0.2` ให้ทำงาน และคง service เก่าบน VPS ไว้ disabled; อย่าหยุด Nginx หากยังมี virtual host อื่นใช้งาน

รายงานทุกขั้นด้วยหลักฐานที่ตรวจได้ ระบุสิ่งที่เปลี่ยน, สิ่งที่ยังไม่ทำ, สถานะเครื่องเดิม/ใหม่ และคำสั่ง rollback ห้ามอ้างว่าทดสอบ production แล้วถ้ายังไม่ได้ตรวจจริง
```
