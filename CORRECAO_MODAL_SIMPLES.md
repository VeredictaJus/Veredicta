# CORREÇÃO SIMPLES PARA O MODAL DE IMAGEM

## PROBLEMA:
Na linha 1054 do arquivo `src/components/Chat/ChatWindow.tsx`, há:
```typescript
onClick={() => window.open(message.file_url, '_blank')}
```

## SOLUÇÃO:
Substitua por:
```typescript
onClick={(e) => { e.preventDefault(); e.stopPropagation(); openImageModal(message.file_url, message.file_name); }}
```

## COMO APLICAR:
1. Abra o arquivo `src/components/Chat/ChatWindow.tsx`
2. Vá para a linha 1054
3. Substitua a linha problemática pela solução acima
4. Salve o arquivo
5. Recarregue a página (F5)

## TESTE:
1. Envie uma imagem no chat
2. Clique na imagem
3. Deve abrir o modal transparente em vez de nova guia

## SE NÃO FUNCIONAR:
Teste primeiro o botão "🖼️ Teste Modal" que está na interface para verificar se o modal está funcionando.


















