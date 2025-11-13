---
title: "Phân tích kháng chấn đập bê tông trọng lực theo phương pháp phổ phản ứng"
layout: single
categories:
  - Ansys
tags:
  - Ansys
  - Phân tích kháng chấn
  - Phổ phản ứng
  - FEM
  - APDL
description: "Hướng dẫn các bước phân tích kháng chấn đập bê tông trọng lực bằng Ansys (APDL) theo phương pháp phổ phản ứng."
---

Để thực hiện phân tích, chúng ta làm việc với mô hình phần tử hữu hạn ba chiều (FEM 3D) của đập bê tông trọng lực. Dưới đây là hình ảnh trực quan của mô hình đã được xây dựng trong Ansys.

<img src="/assets/images/app-icons/mo-hinh-dap-bttl.jpg" alt="Mô hình đập BTTL" title="Mo hinh dap BTTL" style="width: 80%; max-width: 700px; margin: 20px auto; display: block; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">

Dưới đây là toàn bộ tập lệnh (script) APDL để thực hiện phân tích:

```apdl
…..
!Luu mo hinh pthh dap bttl
save,dam_model,db
finish
!Doc file so lieu dam_model
/prep7
resume,dam_model,db
keyopt,2,5,2    !Xuat ung suat diem nut phan tu SOLID65
!Tien hanh phan tich pho phan ung
/solu
!Gan dieu kien bien
csys,0
dsys,0
nsel,s,loc,x,(2+0.9*0.75)*h       !Lua chon diem nut bien nen thuong ha luu dap
nsel,a,loc,x,-1.5*h
nplot
d,all,ux    !Gan rang buoc chuyen vi theo phuong x
allsel

nsel,s,loc,z,h         !Lua chon diem nut bien nen hai vai
nsel,a,loc,z,-(1+1.5)*h
nplot
d,all,uz   !Gan rang buoc chuyen vi theo phuong z
allsel

nsel,s,loc,y,-2*h         !Lua chon diem nut bien day nen
nplot
d,all,uy     !Gan rang buoc chuyen vi theo phuong y
allsel
gplot

!Phan tich modal
antype,modal
modopt,subsp,10     !Dinh nghia 10 buoc dao dong
solve
save,dam_dynamic_rst11,db
finish

!Phan tich pho
/solu
antype,spectr
spopt,sprs,10,yes
svtyp,2
sed,1,1,
!Nhap gia tri tan so dao dong rieng, co the lay tu SET,LIST
freq,0.3444,0.3502,0.3546,0.3739,0.4175,0.4613,0.5114,0.5121,0.5811,0.5837
!Nhap gia tri pho, tinh toan theo cong thuc QP ung voi tung chu ky dao dong rieng
sv,1.226,1.2079,1.1945,1.1389,1.0312,0.9427,0.859,0.858,0.7657,0.7627
solve
save,dam_dynamic_rst2,db
finish

!Mo rong Modal
/solu
antype,modal
expass,on
mxpand,10,,,yes,0.005
solve
save,dam_dynamic_rst3,db
finish

!To hop Modal
/solu
antype,spectr
srss,0.15,disp
solve
save,dam_dynamic_rst4,db
finish

!Xem ket qua
/post1
/input,,mcom
esel,s,type,,2
eplot
SET,FIRST
PLNSOL,U,SUM,1,1         !Xem ket qua chuyen vi o buoc dao dong dau tien
set,next
PLNSOL,U,SUM,1,1         !Xem ket qua chuyen vi o buoc dao dong tiep theo
set,next
PLNSOL,U,SUM,1,1

SET,FIRST
PLNSOL,S,1,0,1                 !Xem ket qua ung suat o buoc dao dong dau tien
PLNSOL,EPTO,1,0,1
SET,next
PLNSOL,S,1,0,1
PLNSOL,EPTO,1,0,1
finish

/post26
csys,0
nsel,s,loc,y,h
nsel,r,loc,z,-0.75*h
nsel,r,loc,x,0
nplot
NSOL,2,1466,U,X,nux           !Chuyen vi diem nut 1466 theo phuong X
NSOL,3,1466,U,Y,nuy
NSOL,4,1466,U,Z,nuz
XVAR,1
PLVAR,2,3,4                     !Ve do thi

ESOL,2,1,19,S,1,s1_19       !Ung suat chinh thu nhat diem nut so 19 phan tu 1
ESOL,6,33,20,S,1,s1_20
ESOL,7,761,9,S,1,s1_9
ESOL,8,746,7,S,1,s1_7
/axlab,x,time
/axlab,y,stress1[pa]
XVAR,1
PLVAR,5,6,7,8                !Ve do thi
```

<p style="text-align: right; font-style: italic; color: #777;">
  (Nguồn: http://hungkcct.files.wordpress.com/)
</p>