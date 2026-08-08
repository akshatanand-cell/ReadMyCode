import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Code2, FileText, Zap, Copy, Check, Play } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { FILE_EXTENSIONS } from '@/utils/constants';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';

const FunctionCard = ({
  name,
  description,
  parameters,
  returns,
  filePath,
  lineStart,
  lineEnd,
  code,
  complexity,
  isExported,
  calls = [],
  calledBy = [],
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileExt = filePath?.split('.').pop()?.toLowerCase();
  const language = FILE_EXTENSIONS[fileExt] || fileExt?.toUpperCase() || 'Code';

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getComplexityColor = (score) => {
    if (score <= 5) return 'success';
    if (score <= 10) return 'warning';
    return 'error';
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div
        className="flex items-start gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Code2 className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-text-primary">{name}</h3>
            {isExported && <Badge variant="accent" size="sm">Exported</Badge>}
            {complexity !== undefined && (
              <Badge variant={getComplexityColor(complexity)} size="sm">
                Complexity: {complexity}
              </Badge>
            )}
          </div>

          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {description}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {filePath}
            </span>
            {lineStart && (
              <span>
                Lines {lineStart}{lineEnd ? `-${lineEnd}` : ''}
              </span>
            )}
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border space-y-4">
              {parameters && parameters.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-2">Parameters</h4>
                  <div className="space-y-2">
                    {parameters.map((param, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-2.5 bg-background-secondary rounded-lg"
                      >
                        <code className="text-sm font-mono text-secondary min-w-[100px]">
                          {param.name}
                        </code>
                        <div className="flex-1">
                          <span className="text-xs text-text-muted">{param.type}</span>
                          {param.description && (
                            <p className="text-sm text-text-secondary mt-0.5">{param.description}</p>
                          )}
                          {param.defaultValue && (
                            <span className="text-xs text-text-muted mt-1 block">
                              Default: <code>{param.defaultValue}</code>
                            </span>
                          )}
                          {param.required && (
                            <Badge variant="error" size="sm" className="mt-1">Required</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {returns && (
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-2">Returns</h4>
                  <div className="p-2.5 bg-background-secondary rounded-lg">
                    <code className="text-sm font-mono text-secondary">{returns.type}</code>
                    {returns.description && (
                      <p className="text-sm text-text-secondary mt-1">{returns.description}</p>
                    )}
                  </div>
                </div>
              )}

              {(calls.length > 0 || calledBy.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {calls.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-text-primary mb-2">Calls</h4>
                      <div className="space-y-1">
                        {calls.map((call, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-text-secondary">
                            <Zap className="w-3.5 h-3.5 text-primary" />
                            <span>{call}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {calledBy.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-text-primary mb-2">Called By</h4>
                      <div className="space-y-1">
                        {calledBy.map((caller, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-text-secondary">
                            <Play className="w-3.5 h-3.5 text-accent" />
                            <span>{caller}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {code && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-text-primary">Source Code</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={() => setIsCodeVisible(!isCodeVisible)}
                        className="text-xs text-primary hover:text-secondary transition-colors"
                      >
                        {isCodeVisible ? 'Hide' : 'Show'} Code
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isCodeVisible && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <pre className="p-4 bg-[#0d1117] rounded-lg overflow-x-auto border border-border">
                          <code className="text-sm font-mono text-text-secondary">
                            {code}
                          </code>
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default FunctionCard;