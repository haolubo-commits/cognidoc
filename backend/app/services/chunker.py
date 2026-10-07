"""
Semantic and sliding window document text chunking service.
"""

import re
from typing import List, Dict, Any


class TextChunker:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    @staticmethod
    def estimate_tokens(text: str) -> int:
        """Lightweight token estimator (~4 characters per token)."""
        return max(1, len(text) // 4)

    def split_into_sentences(self, text: str) -> List[str]:
        """Splits text along sentence boundaries preserving punctuation."""
        # Match sentence terminators (. ! ?) followed by whitespace or newline
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        return [s.strip() for s in sentences if s.strip()]

    def chunk_text(self, text: str, page_number: int = 1) -> List[Dict[str, Any]]:
        """
        Chunks text with sliding window overlap respecting sentence structure.
        """
        if not text.strip():
            return []

        sentences = self.split_into_sentences(text)
        chunks: List[Dict[str, Any]] = []
        
        current_sentences: List[str] = []
        current_len = 0
        chunk_index = 0

        for sentence in sentences:
            sentence_len = len(sentence)
            
            # If single sentence exceeds chunk size, break it into character windows
            if sentence_len > self.chunk_size:
                if current_sentences:
                    chunk_text = " ".join(current_sentences)
                    chunks.append({
                        "chunk_index": chunk_index,
                        "page_number": page_number,
                        "content": chunk_text,
                        "token_count": self.estimate_tokens(chunk_text)
                    })
                    chunk_index += 1
                    current_sentences = []
                    current_len = 0

                # Break large sentence directly
                start = 0
                while start < sentence_len:
                    sub_text = sentence[start : start + self.chunk_size]
                    chunks.append({
                        "chunk_index": chunk_index,
                        "page_number": page_number,
                        "content": sub_text,
                        "token_count": self.estimate_tokens(sub_text)
                    })
                    chunk_index += 1
                    start += self.chunk_size - self.chunk_overlap
                continue

            # Standard sentence aggregation
            if current_len + sentence_len > self.chunk_size and current_sentences:
                chunk_text = " ".join(current_sentences)
                chunks.append({
                    "chunk_index": chunk_index,
                    "page_number": page_number,
                    "content": chunk_text,
                    "token_count": self.estimate_tokens(chunk_text)
                })
                chunk_index += 1

                # Keep overlap sentences
                overlap_sentences = []
                overlap_len = 0
                for s in reversed(current_sentences):
                    if overlap_len + len(s) <= self.chunk_overlap:
                        overlap_sentences.insert(0, s)
                        overlap_len += len(s)
                    else:
                        break
                current_sentences = overlap_sentences
                current_len = overlap_len

            current_sentences.append(sentence)
            current_len += sentence_len

        # Flush any remaining text
        if current_sentences:
            chunk_text = " ".join(current_sentences)
            chunks.append({
                "chunk_index": chunk_index,
                "page_number": page_number,
                "content": chunk_text,
                "token_count": self.estimate_tokens(chunk_text)
            })

        return chunks
