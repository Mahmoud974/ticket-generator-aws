<div align="center">

# ☁️ Ticket Generator — DevOps & Serverless AWS

### Architecture serverless, CI/CD, automatisation et déploiement cloud

</div>

---

## 🎯 Objectif DevOps

Ce projet a été conçu pour mettre en pratique une chaîne complète de livraison et d’exploitation d’une application cloud moderne.

L’objectif n’est pas uniquement de développer une application React, mais surtout de démontrer des compétences en :

- conception d’architecture serverless
- déploiement cloud sur AWS
- automatisation CI/CD
- gestion des services managés AWS
- stockage et persistance des données
- automatisation de workflows
- distribution de contenu via CDN
- supervision et exploitation d’une application cloud
- sécurisation des accès et des échanges

---

## 🏗️ Architecture Cloud

<img
  src="public/images/architecture-serverless.png"
  width="900"
  alt="Architecture serverless AWS"
/>

### Architecture utilisée

```text
Utilisateur
    |
    v
React + TypeScript
    |
    v
AWS Amplify
    |
    v
API Gateway
    |
    v
AWS Lambda
   / \
  /   \
 v     v
DynamoDB   Amazon S3
              |
              v
         Cloudflare CDN

AWS Lambda
    |
    v
n8n
 / \
v   v
EmailJS   Notion