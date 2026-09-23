# Prompt สำหรับย้ายเว็บ 2B2T Thailand ไปเครื่องใหม่

คัดลอกข้อความในกรอบด้านล่างไปใช้กับ agent ที่เข้าถึงทั้งเครื่องต้นทางและเครื่องปลายทางได้

```text
ช่วยย้าย workspace และระบบให้บริการเว็บไซต์ 2B2T Thailand จากเครื่องเดิมไปเครื่องใหม่ โดยทำตามขั้นตอนอย่างระมัดระวัง

Repository: https://github.com/Deluxeg4/2b2t-th-website.git
Branch: main
เครื่องเดิมเป็น Debian และเคยรันเว็บไซต์ที่ /root/2b2t-th-website
systemd unit เดิมชื่อ 2b2t-th-website.service อยู่ที่
/etc/systemd/system/2b2t-th-website.service
Nginx รับ HTTP/HTTPS และ config เดิม proxy ไป 127.0.0.1:3000
service เดิมใช้ `npm run dev` (Vite) และเคย bind ที่ 0.0.0.0:3000

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
   - ใช้ path `/opt/2b2t-th-website` เว้นแต่มีเหตุผลให้ใช้ path อื่น
   - clone repository จาก branch `main`; ใช้ `npm ci`, `npm run lint`, `npm run build`
   - ไม่คัดลอก `node_modules` หรือ `dist` จากเครื่องเดิม ให้สร้างใหม่บนเครื่องปลายทาง

3. เลือก deployment หลังยืนยัน ingress จริง:
   - หาก Cloudflare Worker เป็นผู้ serve เว็บ: ใช้ `wrangler.jsonc` และ `worker/index.js` เป็นแหล่งอ้างอิง, สร้าง build ใหม่และ deploy Worker/Assets โดยรักษา routes, cron, `STATUS_KV` binding และข้อมูล KV เดิมไว้ ห้ามสร้าง namespace ใหม่หรือเปลี่ยน ID โดยไม่จำเป็น
   - หากย้าย origin ไป VPS/Nginx: แนะนำให้ Nginx serve เนื้อหาใน `dist` สำหรับ production แทน Vite dev server; ตั้ง TLS, proxy/static config, firewall และ systemd เฉพาะที่จำเป็น
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
   - เมื่อยืนยันแล้ว ให้หยุดเฉพาะ `2b2t-th-website.service` บนเครื่องเดิมด้วย `systemctl stop 2b2t-th-website.service`; อย่าหยุด Nginx หากยังมี virtual host อื่นใช้งาน

รายงานทุกขั้นด้วยหลักฐานที่ตรวจได้ ระบุสิ่งที่เปลี่ยน, สิ่งที่ยังไม่ทำ, สถานะเครื่องเดิม/ใหม่ และคำสั่ง rollback ห้ามอ้างว่าทดสอบ production แล้วถ้ายังไม่ได้ตรวจจริง
```
