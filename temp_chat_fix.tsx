  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedConversation || isSending) return;

    const content = inputValue.trim();
    const attachments = await uploadAttachmentsToStorage(
  selectedConversation.id,
  newMessage.id, // ou outro identificador de mensagem
  selectedFiles
);

    const newMessage = {
      id: `temp-${Date.now()}`,
      content,
      attachments,
      createdAt: new Date().toISOString(),
      user: currentUser,
      status: 'sending' as const
    };

    // Update UI immediately
    setSelectedConversation(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, newMessage]
      };
    });

    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation.id
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      )
    );

    setSelectedFiles([]);
    setInputValue('');
    setIsSending(true);

    try {
      const success = await sendMessage(selectedConversation.id, content.trim(), attachments);
      
      if (success) {
        // Update message status to sent
        setSelectedConversation(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: 'sent' }
                : msg
            )
          };
        });

        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  messages: conv.messages.map(msg => 
                    msg.id === newMessage.id 
                      ? { ...msg, status: 'sent' }
                      : msg
                  )
                }
              : conv
          )
        );
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSearch = (query: string) => {
    updateFilters({ query });
  };

  const handleMarkAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
    markAsRead(conversationId);
  };